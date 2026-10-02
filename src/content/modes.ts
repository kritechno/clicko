import type { Lang } from '../engine/layout';
import type { Line, Mode, SessionSpec } from '../engine/session';
import { drill, pickWords, rng, shuffle, wrapLines, type Rng } from '../engine/generator';
import { WORDS } from './words';
import { PLACEMENT, QUOTES } from './texts';
import { buildLesson, chapterById, lessonId } from './chapters';

export interface ModeEntry {
  key: string;
  mode: Mode;
  /** player level that unlocks it */
  level: number;
  /** needs both languages placed */
  both?: boolean;
  timeLimit?: number;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}

export const MODE_LIST: ModeEntry[] = [
  { key: 'flow', mode: 'flow', level: 1, name: { en: 'flow', ru: 'поток' }, desc: { en: 'endless and quiet. esc when you are done.', ru: 'бесконечно и тихо. esc, когда хватит.' } },
  { key: 'quotes', mode: 'quotes', level: 2, name: { en: 'quotes', ru: 'цитаты' }, desc: { en: 'short calm lines and haiku.', ru: 'короткие спокойные строки и хайку.' } },
  { key: 'sprint30', mode: 'sprint', level: 3, timeLimit: 30, name: { en: 'sprint 30', ru: 'спринт 30' }, desc: { en: 'thirty seconds, as far as you get.', ru: 'тридцать секунд, сколько успеешь.' } },
  { key: 'sprint60', mode: 'sprint', level: 3, timeLimit: 60, name: { en: 'sprint 60', ru: 'спринт 60' }, desc: { en: 'one minute, as far as you get.', ru: 'одна минута, сколько успеешь.' } },
  { key: 'weak', mode: 'weak', level: 4, name: { en: 'weak keys', ru: 'слабые клавиши' }, desc: { en: 'text built from your slowest keys.', ru: 'текст из твоих самых медленных клавиш.' } },
  { key: 'clean', mode: 'clean', level: 5, name: { en: 'clean hands', ru: 'чистые руки' }, desc: { en: 'ends at the third slip. how far can you go?', ru: 'до третьей ошибки. как далеко получится?' } },
  { key: 'switch', mode: 'switch', level: 6, both: true, name: { en: 'switch', ru: 'переключение' }, desc: { en: 'english and russian lines take turns.', ru: 'английские и русские строки по очереди.' } },
  { key: 'beat', mode: 'beat', level: 7, name: { en: 'on the beat', ru: 'в ритм' }, desc: { en: 'type in time with the tempo. rhythm over speed.', ru: 'печатай в такт. ритм важнее скорости.' } },
];

export const unlockedModes = (level: number, both: boolean): Mode[] =>
  MODE_LIST.filter((m) => level >= m.level && (!m.both || both)).map((m) => m.mode);

export function toLines(text: string, lang: Lang, max: number, trailing = false): Line[] {
  const lines = wrapLines(text, max).map((t) => ({ text: t, lang }));
  if (trailing && lines.length) lines[lines.length - 1].text += ' ';
  return lines;
}

const seed = () => Math.floor(Math.random() * 2 ** 31);

function wordLines(r: Rng, lang: Lang, weak: string[], share: number, max: number, trailing: boolean): Line[] {
  return toLines(pickWords(r, WORDS[lang], 30, { weak, weakShare: share }).join(' '), lang, max, trailing);
}

export interface BuildCtx {
  weak: string[];
  /** max characters per line */
  max: number;
  bpm: number;
  ui: Lang;
}

export function buildMode(m: ModeEntry, lang: Lang, c: BuildCtx): SessionSpec {
  const r = rng(seed());
  const base = { mode: m.mode, lang, title: m.name[c.ui] };
  switch (m.mode) {
    case 'quotes':
      return { ...base, lines: toLines(shuffle(r, QUOTES[lang]).slice(0, 2).join(' '), lang, c.max) };
    case 'weak': {
      const singles = c.weak.filter((k) => k.length === 1);
      const tokens = pickWords(r, WORDS[lang], 28, { weak: c.weak, weakShare: 0.8 });
      if (singles.length) for (let i = 4; i < tokens.length; i += 5) tokens.splice(i, 0, drill(r, singles, [], 1));
      return { ...base, lines: toLines(tokens.join(' '), lang, c.max) };
    }
    case 'switch': {
      const n = c.max < 40 ? 3 : 5;
      const other: Lang = lang === 'en' ? 'ru' : 'en';
      const lines: Line[] = Array.from({ length: 8 }, (_, i) => {
        const l = i % 2 ? other : lang;
        return { lang: l, text: pickWords(r, WORDS[l], n).join(' ') + (i < 7 ? ' ' : '') };
      });
      return { ...base, lines };
    }
    case 'beat':
      return { ...base, bpm: c.bpm, lines: wordLines(r, lang, c.weak, 0.2, c.max, false) };
    default: {
      // flow, sprint, clean: endless
      const more = () => wordLines(r, lang, c.weak, 0.2, c.max, true);
      return { ...base, lines: more(), more, timeLimit: m.timeLimit, maxMisses: m.mode === 'clean' ? 3 : undefined };
    }
  }
}

export function lessonSpec(lang: Lang, chapter: number, index: number, weak: string[], max: number, ui: Lang): SessionSpec {
  const ch = chapterById(chapter);
  return {
    mode: 'lesson', lang, chapter, index,
    lessonId: lessonId(lang, chapter, index),
    title: `${ch.title[ui]} · ${ch.lessons[index][ui]}`,
    lines: toLines(buildLesson(lang, chapter, index, seed(), weak), lang, max),
  };
}

export function placementSpec(lang: Lang, max: number, title: string): SessionSpec {
  return { mode: 'placement', lang, title, lines: toLines(PLACEMENT[lang], lang, max) };
}
