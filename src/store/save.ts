import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { langOfChar, type Lang } from '../engine/layout';
import type { Mode, SessionResult } from '../engine/session';
import { mergeBigrams, mergeKeys, weakKeys, type KeyStats } from '../engine/stats';
import {
  levelOf, notesFor, placementStart, roomItems, targetWpm, xpFor, type Lessons, type Track,
} from '../engine/progress';
import { applySession, dailyTasks, dateKey, taskDone, weekKey, type Task } from '../engine/tasks';
import type { RoomItem } from '../content/chapters';
import { DEFAULT_EQUIPPED, DEFAULT_OWNED, SHOP, type Slot } from '../content/shop';
import { STAMPS } from '../content/stamps';
import { unlockedModes } from '../content/modes';

export const WEEKLY_GOAL = 5000;

/** 'keys', 'music', or an ambience id from public/ambience/manifest.json */
export type VolKey = string;

export interface HistoryRec {
  lang: Lang;
  mode: Mode;
  wpm: number;
  acc: number;
  at: number;
}

export interface SaveData {
  uiLang: Lang;
  lang: Lang;
  /** languages the player chose to practice */
  langs: Lang[];
  welcomed: boolean;
  tracks: Record<Lang, Track>;
  lessons: Lessons;
  xp: number;
  beans: number;
  keyStats: Record<Lang, KeyStats>;
  bigrams: Record<Lang, KeyStats>;
  history: HistoryRec[];
  best: Record<Lang, number>;
  stamps: Record<string, string>;
  owned: string[];
  equipped: Record<Slot, string>;
  daily: { date: string; tasks: Task[] };
  candles: string[];
  weekly: { week: string; chars: number; done: boolean };
  postcards: number;
  counters: { yo: number; flowMs: number; chars: number; sessions: number };
  showKeyboard: boolean;
  roomMotion: boolean;
  muted: boolean;
  vol: Record<VolKey, number>;
}

export interface Rewards {
  notes: number;
  newNotes: number;
  target: number;
  xp: number;
  beans: number;
  levelUp: number | null;
  items: RoomItem[];
  stamps: string[];
  tasks: number;
  candle: boolean;
  postcard: boolean;
  /** wpm vs. recent average, when there is enough history */
  delta: number | null;
  best: boolean;
  weak: string | null;
  placedAt: number | null;
}

interface Actions {
  welcome: (ui: Lang, langs: Lang[]) => void;
  setLang: (lang: Lang) => void;
  setUi: (ui: Lang) => void;
  ensureDaily: () => void;
  finish: (r: SessionResult) => Rewards;
  /** buys if needed, then equips; returns false when beans are short */
  take: (id: string) => boolean;
  setVol: (k: VolKey, v: number) => void;
  toggle: (k: 'muted' | 'showKeyboard' | 'roomMotion') => void;
  importSave: (data: Partial<SaveData>) => void;
  reset: () => void;
}

const noTrack: Track = { placed: false, placementWpm: 0, start: 1 };

function initial(): SaveData {
  const ui: Lang = typeof navigator !== 'undefined' && navigator.language?.startsWith('ru') ? 'ru' : 'en';
  return {
    uiLang: ui, lang: ui, langs: [], welcomed: false,
    tracks: { en: noTrack, ru: noTrack },
    lessons: {}, xp: 0, beans: 0,
    keyStats: { en: {}, ru: {} }, bigrams: { en: {}, ru: {} },
    history: [], best: { en: 0, ru: 0 },
    stamps: {}, owned: DEFAULT_OWNED, equipped: DEFAULT_EQUIPPED,
    daily: { date: '', tasks: [] }, candles: [],
    weekly: { week: '', chars: 0, done: false }, postcards: 0,
    counters: { yo: 0, flowMs: 0, chars: 0, sessions: 0 },
    showKeyboard: true, roomMotion: true, muted: false,
    vol: { keys: 0.7, music: 0.4 },
  };
}

function freshDaily(s: SaveData, today: string): SaveData['daily'] {
  if (s.daily.date === today) return s.daily;
  const langs = s.langs.filter((l) => s.tracks[l].placed);
  return { date: today, tasks: dailyTasks(today, langs.length ? langs : [s.lang], unlockedModes(levelOf(s.xp), langs.length > 1)) };
}

/** Weak single keys first, then weak bigrams, for text generation. */
export function weakFor(s: SaveData, lang: Lang): string[] {
  return [...weakKeys(s.keyStats[lang], 5), ...weakKeys(s.bigrams[lang], 3, 6)];
}

export const useSave = create<SaveData & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),

      welcome: (ui, langs) =>
        set((s) => {
          const next = { ...s, uiLang: ui, langs, lang: langs[0], welcomed: true, daily: { date: '', tasks: [] } };
          return { ...next, daily: freshDaily(next, dateKey(new Date())) };
        }),
      setLang: (lang) => set((s) => ({ lang, langs: s.langs.includes(lang) ? s.langs : [...s.langs, lang] })),
      setUi: (uiLang) => set({ uiLang }),
      ensureDaily: () => set((s) => ({ daily: freshDaily(s, dateKey(new Date())) })),

      finish: (r) => {
        const s = get();
        const now = new Date(r.at);
        const today = dateKey(now);
        const lang = r.lang;

        let tracks = s.tracks;
        let placedAt: number | null = null;
        if (r.mode === 'placement') {
          placedAt = placementStart(r.wpm);
          tracks = { ...tracks, [lang]: { placed: true, placementWpm: r.wpm, start: placedAt } };
        }

        const of = (l: Lang) => (ch: string) => langOfChar(ch, lang) === l;
        const keyStats = { en: mergeKeys(s.keyStats.en, r.log, of('en')), ru: mergeKeys(s.keyStats.ru, r.log, of('ru')) };
        const bigrams = { en: mergeBigrams(s.bigrams.en, r.log, of('en')), ru: mergeBigrams(s.bigrams.ru, r.log, of('ru')) };

        const langHistory = s.history.filter((h) => h.lang === lang);
        const target = targetWpm(langHistory.filter((h) => h.mode === 'lesson').map((h) => h.wpm), tracks[lang].placementWpm);
        let notes = 0, newNotes = 0, lessons = s.lessons;
        if (r.mode === 'lesson' && r.lessonId) {
          notes = notesFor(r.acc, r.wpm, target);
          const prev = lessons[r.lessonId];
          newNotes = Math.max(0, notes - (prev?.notes ?? 0));
          lessons = {
            ...lessons,
            [r.lessonId]: { notes: Math.max(notes, prev?.notes ?? 0), wpm: Math.max(r.wpm, prev?.wpm ?? 0), acc: Math.max(r.acc, prev?.acc ?? 0) },
          };
        }
        const before = roomItems(s.lessons, s.tracks);
        const allItems = roomItems(lessons, tracks);
        const items = allItems.filter((i) => !before.includes(i));

        const xp = xpFor(r.chars, r.acc, r.avgFlow);
        const levelBefore = levelOf(s.xp), levelAfter = levelOf(s.xp + xp);
        const levelUp = levelAfter > levelBefore ? levelAfter : null;

        let daily = freshDaily(s, today);
        const doneBefore = daily.tasks.filter(taskDone).length;
        if (r.mode !== 'placement') daily = { ...daily, tasks: applySession(daily.tasks, r) };
        const doneAfter = daily.tasks.filter(taskDone).length;
        const tasks = doneAfter - doneBefore;
        const candle = daily.tasks.length > 0 && doneAfter === daily.tasks.length && !s.candles.includes(today);
        const candles = candle ? [...s.candles, today] : s.candles;

        const wk = weekKey(now);
        let weekly = s.weekly.week === wk ? s.weekly : { week: wk, chars: 0, done: false };
        weekly = { ...weekly, chars: weekly.chars + r.chars };
        const postcard = !weekly.done && weekly.chars >= WEEKLY_GOAL;
        if (postcard) weekly.done = true;
        const postcards = s.postcards + (postcard ? 1 : 0);

        const timed = r.chars >= 80 && r.acc >= 0.9 && r.mode !== 'switch' && r.mode !== 'beat';
        const best = timed && r.wpm > s.best[lang];
        const recent = langHistory.slice(-10);
        const delta = recent.length >= 3 && r.chars >= 40 ? r.wpm - recent.reduce((a, h) => a + h.wpm, 0) / recent.length : null;

        const counters = {
          yo: s.counters.yo + r.typed.split(/\s+/).filter((w) => /ё/i.test(w)).length,
          flowMs: s.counters.flowMs + r.fullFlowMs,
          chars: s.counters.chars + r.chars,
          sessions: s.counters.sessions + 1,
        };

        const ctx = { r, notes, hour: now.getHours(), lessons, tracks, counters, candles: candles.length, postcards, items: allItems };
        const stamps = STAMPS.filter((st) => !s.stamps[st.id] && st.check(ctx)).map((st) => st.id);

        const beans =
          Math.floor((r.chars * r.acc) / 25) + newNotes * 3 + (levelUp ? 30 : 0) + tasks * 15 + (candle ? 20 : 0) + (postcard ? 50 : 0);

        set({
          tracks, lessons, keyStats, bigrams, daily, candles, weekly, postcards, counters,
          xp: s.xp + xp,
          beans: s.beans + beans,
          best: best ? { ...s.best, [lang]: r.wpm } : s.best,
          history: [...s.history, { lang, mode: r.mode, wpm: r.wpm, acc: r.acc, at: r.at }].slice(-200),
          stamps: { ...s.stamps, ...Object.fromEntries(stamps.map((id) => [id, today])) },
        });

        return {
          notes, newNotes, target, xp, beans, levelUp, items, stamps, tasks, candle, postcard, delta, best, placedAt,
          weak: weakKeys(keyStats[lang], 1)[0] ?? null,
        };
      },

      take: (id) => {
        const s = get();
        const it = SHOP.find((i) => i.id === id);
        if (!it) return false;
        const owned = s.owned.includes(id);
        if (!owned && s.beans < it.price) return false;
        set({
          owned: owned ? s.owned : [...s.owned, id],
          beans: owned ? s.beans : s.beans - it.price,
          equipped: { ...s.equipped, [it.slot]: it.value },
        });
        return true;
      },

      setVol: (k, v) => set((s) => ({ vol: { ...s.vol, [k]: Math.max(0, Math.min(1, Math.round(v * 10) / 10)) } })),
      toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<SaveData>),
      importSave: (data) => set({ ...initial(), ...data }),
      reset: () => set(initial()),
    }),
    { name: 'clicko-save-v1', version: 1 },
  ),
);
