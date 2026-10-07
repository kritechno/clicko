import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Lang } from '../engine/layout';
import { isUnlocked, levelOf } from '../engine/progress';
import { weakKeys } from '../engine/stats';
import { streak, dateKey } from '../engine/tasks';
import { CHAPTERS, lessonId } from '../content/chapters';
import { MODE_LIST, type ModeEntry } from '../content/modes';
import { SHOP, SLOTS } from '../content/shop';
import { STAMPS } from '../content/stamps';
import { useSave, type SaveData } from '../store/save';
import { ambienceName, type Ambience } from '../audio/ambience';
import { playKey, type SoundPack } from '../audio/keys';
import type { T } from '../i18n';
import { useKeys } from './hooks';
import { ShopPreview } from './RoomSprites';

export interface Row {
  label: ReactNode;
  right?: ReactNode;
  /** section heading, not selectable */
  head?: boolean;
  dim?: boolean;
  equipped?: boolean;
  onEnter?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

/** Keyboard-first list: arrows move, enter acts, esc goes back. */
export function List({ title, rows, note, t, onBack, variant }: { title: string; rows: Row[]; note?: ReactNode; t: T; onBack: () => void; variant?: 'shop' }) {
  const selectable = rows.map((r, i) => (r.head ? -1 : i)).filter((i) => i >= 0);
  const [sel, setSel] = useState(0);
  const cur = selectable[Math.min(sel, selectable.length - 1)];
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ block: 'nearest' }); }, [cur]);

  useKeys((e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.closest('button') && !e.target.closest('.list-option')) return;
    const row = rows[cur];
    if (e.key === 'ArrowDown') setSel((s) => Math.min(selectable.length - 1, s + 1));
    else if (e.key === 'ArrowUp') setSel((s) => Math.max(0, s - 1));
    else if (e.key === 'Enter') row?.onEnter?.();
    else if (e.key === 'ArrowLeft') row?.onLeft?.();
    else if (e.key === 'ArrowRight') row?.onRight?.();
    else if (e.key === 'Escape') onBack();
    else return;
    e.preventDefault();
  });

  return (
    <div className={`screen ${variant === 'shop' ? 'shop-screen' : ''}`}>
      <h2>{title}</h2>
      <ul className={`list ${variant === 'shop' ? 'shop-list' : ''}`}>
        {rows.map((r, i) =>
          r.head ? (
            <li key={i} className="head">{r.label}</li>
          ) : (
            <li
              key={i}
              ref={i === cur ? ref : undefined}
              className={`${i === cur ? 'sel' : ''} ${r.dim ? 'dim' : ''} ${r.equipped ? 'equipped' : ''}`}
            >
              <button className="list-option" aria-pressed={r.equipped} onFocus={() => setSel(selectable.indexOf(i))}
                onClick={() => { setSel(selectable.indexOf(i)); r.onEnter?.(); }}>
                <span>{r.label}</span>
                <span className="right">{r.right}</span>
              </button>
            </li>
          ),
        )}
      </ul>
      <div className="note" role="status">{note ?? ' '}</div>
      <div className="foot"><span>{t('select')}</span><button onClick={onBack}>{t('back')}</button></div>
    </div>
  );
}

export function MapScreen({ t, onStart, onBack }: { t: T; onStart: (chapter: number, index: number) => void; onBack: () => void }) {
  const s = useSave();
  const lang = s.lang, ui = s.uiLang, track = s.tracks[lang];
  const [pos, setPos] = useState(() => ({ c: Math.max(0, track.start - 1), i: 0 }));
  const ch = CHAPTERS[pos.c];
  const open = (c: number, i: number) => isUnlocked(s.lessons, track, lang, c, i);
  const rec = s.lessons[lessonId(lang, ch.id, pos.i)];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ block: 'nearest' }); }, [pos.c]);

  useKeys((e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const clamp = (c: number, i: number) => ({ c, i: Math.min(i, CHAPTERS[c].lessons.length - 1) });
    if (e.key === 'ArrowDown') setPos((p) => clamp(Math.min(CHAPTERS.length - 1, p.c + 1), p.i));
    else if (e.key === 'ArrowUp') setPos((p) => clamp(Math.max(0, p.c - 1), p.i));
    else if (e.key === 'ArrowRight') setPos((p) => clamp(p.c, p.i + 1));
    else if (e.key === 'ArrowLeft') setPos((p) => ({ c: p.c, i: Math.max(0, p.i - 1) }));
    else if (e.key === 'Enter') { if (open(ch.id, pos.i)) onStart(ch.id, pos.i); }
    else if (e.key === 'Escape') onBack();
    else return;
    e.preventDefault();
  });

  return (
    <div className="screen">
      <h2>{t('lessons')} · {t(lang === 'en' ? 'trackEn' : 'trackRu')}</h2>
      <div className="map">
        {CHAPTERS.map((c, ci) => (
          <div className="map-row" key={c.id} ref={ci === pos.c ? ref : undefined}>
            <span className={`map-title ${ci === pos.c ? '' : 'dim'}`}>
              {String(c.id).padStart(2, '0')} {c.title[ui]}
              {track.placed && c.id < track.start ? <em> · {t('review')}</em> : null}
            </span>
            <span className="cells">
              {c.lessons.map((_, i) => {
                const n = s.lessons[lessonId(lang, c.id, i)]?.notes ?? 0;
                const isOpen = open(c.id, i);
                return (
                  <span
                    key={i}
                    className={`cell ${ci === pos.c && i === pos.i ? 'sel' : ''} ${isOpen ? '' : 'shut'}`}
                    onClick={() => { setPos({ c: ci, i }); if (isOpen) onStart(c.id, i); }}
                  >
                    {isOpen ? [1, 2, 3].map((k) => <i key={k} className={k <= n ? 'lit' : ''}>♪</i>) : '·'}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      <div className="note">
        {ch.lessons[pos.i][ui]} ·{' '}
        {!open(ch.id, pos.i) ? t('locked') : rec ? t('bestOf', Math.round(rec.wpm), Math.floor(rec.acc * 100)) : t('notPlayed')}
      </div>
      <div className="foot">{t('select')} · {t('back')}</div>
    </div>
  );
}

export function ModesScreen({ t, onStart, onBack }: { t: T; onStart: (m: ModeEntry) => void; onBack: () => void }) {
  const s = useSave();
  const level = levelOf(s.xp);
  const both = s.tracks.en.placed && s.tracks.ru.placed;
  const [note, setNote] = useState('');
  const rows: Row[] = MODE_LIST.map((m) => {
    const lockLevel = level < m.level, lockBoth = !!m.both && !both;
    const locked = lockLevel || lockBoth;
    return {
      label: <>{m.name[s.uiLang]} <small>{m.desc[s.uiLang]}</small></>,
      right: lockLevel ? t('atLevel', m.level) : lockBoth ? t('needBoth') : '',
      dim: locked,
      onEnter: () => (locked ? setNote(lockLevel ? t('atLevel', m.level) : t('needBoth')) : onStart(m)),
    };
  });
  return <List title={t('modes')} rows={rows} note={note} t={t} onBack={onBack} />;
}

export function ShopScreen({ t, onBack }: { t: T; onBack: () => void }) {
  const s = useSave();
  const ui = s.uiLang;
  const [note, setNote] = useState('');
  const rows: Row[] = SLOTS.flatMap(({ slot, name }) => [
    { label: name[ui], head: true } as Row,
    ...SHOP.filter((i) => i.slot === slot).map((i): Row => {
      const owned = s.owned.includes(i.id);
      const on = s.equipped[slot] === i.value;
      return {
        label: <span className="shop-item"><ShopPreview item={i} /><span>{i.name[ui]}</span></span>,
        equipped: on,
        right: on ? t('equipped') : owned ? t('owned') : `${i.price} ◦`,
        dim: !owned && s.beans < i.price,
        onEnter: () => setNote(s.take(i.id) ? '' : t('notEnough')),
      };
    }),
  ]);
  return <List title={`${t('shop')} · ${s.beans} ◦ ${t('beans')}`} rows={rows} note={note} t={t} onBack={onBack} variant="shop" />;
}

export function BoardScreen({ t, onBack }: { t: T; onBack: () => void }) {
  const s = useSave();
  const ui = s.uiLang;
  useKeys((e) => { if (e.key === 'Escape') { e.preventDefault(); onBack(); } });
  const weak = (l: Lang) => weakKeys(s.keyStats[l], 5).join(' ') || '-';
  const langs = (['en', 'ru'] as Lang[]).filter((l) => s.tracks[l].placed);
  return (
    <div className="screen">
      <h2>{t('stamps')} · {Object.keys(s.stamps).length} / {STAMPS.length}</h2>
      <div className="board">
        {STAMPS.map((st) => (
          <div key={st.id} className={`stamp ${s.stamps[st.id] ? 'got' : ''}`}>
            <b>{st.name[ui]}</b>
            <span>{st.desc[ui]}</span>
          </div>
        ))}
      </div>
      <div className="facts">
        {langs.map((l) => (
          <span key={l}>{t(l === 'en' ? 'trackEn' : 'trackRu')}: {t('statsBest')} {Math.round(s.best[l])} {t('wpm')} · {t('statsWeak')} {weak(l)}</span>
        ))}
        <span>
          {t('statsChars')} {s.counters.chars} · {t('statsSessions')} {s.counters.sessions} · {t('statsCandles')} {s.candles.length} ({t('streak', streak(s.candles, dateKey(new Date())))}) · {t('statsPostcards')} {s.postcards}
        </span>
      </div>
      <div className="foot">{t('back')}</div>
    </div>
  );
}

const bar = (v: number) => '▮'.repeat(Math.round(v * 10)) + '▯'.repeat(10 - Math.round(v * 10));

const SAVE_KEYS: (keyof SaveData)[] = [
  'uiLang', 'lang', 'langs', 'welcomed', 'tracks', 'lessons', 'xp', 'beans', 'keyStats', 'bigrams', 'history', 'best',
  'stamps', 'owned', 'equipped', 'daily', 'candles', 'weekly', 'postcards', 'counters', 'showKeyboard', 'roomMotion', 'muted', 'vol',
];

export function SettingsScreen({ t, tracks, ambiences, onBack }: { t: T; tracks: number; ambiences: Ambience[]; onBack: () => void }) {
  const s = useSave();
  const ui = s.uiLang;

  const vol = (k: string, label: string): Row => ({
    label,
    right: bar(s.vol[k] ?? 0),
    onLeft: () => s.setVol(k, (s.vol[k] ?? 0) - 0.1),
    onRight: () => s.setVol(k, (s.vol[k] ?? 0) + 0.1),
    onEnter: () => s.setVol(k, (s.vol[k] ?? 0) > 0 ? 0 : 0.4),
  });
  // only packs the player owns; the rest are bought in the shop
  const packs = SHOP.filter((i) => i.slot === 'sound' && s.owned.includes(i.id));
  const packAt = packs.findIndex((i) => i.value === s.equipped.sound);
  const cyclePack = (d: number) => {
    const next = packs[(packAt + d + packs.length) % packs.length];
    s.take(next.id);
    playKey(next.value as SoundPack);
  };
  const file = useRef<HTMLInputElement>(null);
  const [armed, setArmed] = useState(false);

  const exportSave = () => {
    const data = Object.fromEntries(SAVE_KEYS.map((k) => [k, s[k]]));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'clicko-save.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importSave = async (f: File | undefined) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data && typeof data === 'object' && data.tracks && data.lessons) {
        s.importSave(Object.fromEntries(SAVE_KEYS.filter((k) => k in data).map((k) => [k, data[k]])));
      }
    } catch {
      // not a save file; leave everything as it is
    }
  };

  const rows: Row[] = [
    { label: t('sound'), head: true },
    {
      label: t('keySound'),
      right: `‹ ${packs[packAt]?.name[ui] ?? ''} ›`,
      onLeft: () => cyclePack(-1), onRight: () => cyclePack(1), onEnter: () => cyclePack(1),
    },
    vol('keys', t('keysVol')),
    { ...vol('music', t('music')), dim: tracks === 0 },
    { label: t('ambience'), head: true },
    ...(ambiences.length
      ? ambiences.map((a) => vol(a.id, ambienceName(a, ui)))
      : [{ label: t('noAmbience'), dim: true } as Row]),
    { label: t('general'), head: true },
    { label: t('uiLanguage'), right: s.uiLang === 'en' ? 'english' : 'русский', onEnter: () => s.setUi(s.uiLang === 'en' ? 'ru' : 'en') },
    { label: t('showKb'), right: t(s.showKeyboard ? 'on' : 'off'), onEnter: () => s.toggle('showKeyboard') },
    { label: ui === 'ru' ? 'анимация комнаты' : 'room animations', right: t(s.roomMotion ? 'on' : 'off'), onEnter: () => s.toggle('roomMotion') },
    { label: t('exportSave'), onEnter: exportSave },
    { label: t('importSave'), onEnter: () => file.current?.click() },
    { label: t('reset'), onEnter: () => (armed ? (s.reset(), setArmed(false)) : setArmed(true)) },
  ];
  const note = armed ? t('resetConfirm') : s.muted ? t('muted') : t('muteHint');
  return (
    <>
      <List title={t('settings')} rows={rows} note={note} t={t} onBack={onBack} />
      <input ref={file} type="file" accept="application/json" hidden onChange={(e) => importSave(e.target.files?.[0])} />
    </>
  );
}
