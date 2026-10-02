import { useRef } from 'react';
import type { Lang } from '../engine/layout';
import type { SessionResult } from '../engine/session';
import type { Rewards } from '../store/save';
import { chapterById } from '../content/chapters';
import { STAMPS } from '../content/stamps';
import { ITEM_NAMES, titleFor, type Key, type T } from '../i18n';
import { useCount, useKeys } from './hooks';

interface Props {
  r: SessionResult;
  rw: Rewards;
  ui: Lang;
  t: T;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

function Stat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const v = useCount(value);
  return (
    <div className="stat">
      <b>{Math.round(v)}{suffix}</b>
      <span>{label}</span>
    </div>
  );
}

export function Result({ r, rw, ui, t, onNext, onRetry, onHome }: Props) {
  const shownAt = useRef(performance.now());
  useKeys((e) => {
    // timed modes end mid-word; don't let the tail of that typing press a button here
    if (e.metaKey || e.ctrlKey || e.altKey || performance.now() - shownAt.current < 700) return;
    if (e.key === 'Enter') { e.preventDefault(); onNext(); }
    else if (e.code === 'KeyR' && r.mode !== 'placement') onRetry();
    else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); onHome(); }
  });

  const lines: string[] = [];
  if (rw.placedAt) lines.push(t('placed', rw.placedAt, chapterById(rw.placedAt).title[ui]));
  if (rw.best) lines.push(t('newBest'));
  if (rw.delta !== null && rw.delta >= 1) lines.push(t('deltaUp', Math.round(rw.delta)));
  if (rw.levelUp) lines.push(t('levelUp', rw.levelUp, titleFor(ui, rw.levelUp)));
  if (rw.items.length) lines.push(t('itemNew', rw.items.map((i) => ITEM_NAMES[i][ui]).join(', ')));
  if (rw.stamps.length) lines.push(t('stampNew', rw.stamps.map((id) => STAMPS.find((s) => s.id === id)?.name[ui] ?? id).join(', ')));
  if (rw.tasks) lines.push(t('tasksDone', rw.tasks));
  if (rw.candle) lines.push(t('candleLit'));
  if (rw.postcard) lines.push(t('postcardNew'));
  if (rw.weak) lines.push(t('weakKey', rw.weak));

  return (
    <div className="result">
      {r.mode === 'lesson' && (
        <div className="notes" aria-label={`${rw.notes} / 3`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= rw.notes ? 'lit' : ''} style={{ animationDelay: `${n * 180}ms` }}>♪</span>
          ))}
        </div>
      )}
      <div className="phrase">{t(`phrase${r.mode === 'lesson' ? rw.notes : 0}` as Key)}</div>

      <div className="stats">
        <Stat value={r.wpm} label={t('wpm')} />
        <Stat value={Math.floor(r.acc * 100)} label={t('accuracy')} suffix="%" />
        {r.onBeat !== undefined && <Stat value={r.onBeat * 100} label={t('onBeat')} suffix="%" />}
        {r.mode !== 'lesson' && r.mode !== 'placement' && <Stat value={r.chars} label={t('characters')} />}
      </div>

      <div className="gain">+{rw.xp} xp · +{rw.beans} {t('beans')}</div>
      {r.mode === 'lesson' && rw.notes < 3 && <div className="dim small">{t('target', Math.ceil(rw.target))}</div>}

      <ul className="rewards">
        {lines.map((l, i) => (
          <li key={i} style={{ animationDelay: `${500 + i * 160}ms` }}>{l}</li>
        ))}
      </ul>
      <div className="foot">{t('resKeys')}</div>
    </div>
  );
}
