import { useEffect, useReducer, useRef, useState } from 'react';
import { scriptOf, translate, type Lang } from '../engine/layout';
import type { Line, SessionResult, SessionSpec } from '../engine/session';
import { createTyping, extend, press, summary, type TypingState } from '../engine/typing';
import { playChime, playKey, playMiss, playTick, type SoundPack } from '../audio/keys';
import type { T } from '../i18n';
import { Keyboard } from './Keyboard';
import { useKeys } from './hooks';

interface Props {
  spec: SessionSpec;
  t: T;
  showKeyboard: boolean;
  pack: SoundPack;
  onFlow: (flow: number) => void;
  onFinish: (r: SessionResult) => void;
  onAbort: () => void;
}

function LineView({ line, start, eng }: { line: Line; start: number; eng: TypingState }) {
  const out: JSX.Element[] = [];
  const chars = [...line.text];
  let i = 0;
  const char = (j: number) => {
    const gi = start + j;
    const cls = gi < eng.pos ? (eng.missedAt[gi] ? 'bad' : 'ok') : 'todo';
    return <span key={j} className={cls}>{chars[j]}</span>;
  };
  while (i < chars.length) {
    if (chars[i] === ' ') {
      out.push(char(i++));
      continue;
    }
    const from = i;
    const word: JSX.Element[] = [];
    while (i < chars.length && chars[i] !== ' ') word.push(char(i++));
    out.push(<span key={`w${from}`} className={`word ${eng.pos >= start + i ? 'done' : ''}`}>{word}</span>);
  }
  return <>{out}</>;
}

export function Typing({ spec, t, showKeyboard, pack, onFlow, onFinish, onAbort }: Props) {
  const eng = useRef<TypingState | null>(null);
  if (!eng.current) eng.current = createTyping(spec.lines.map((l) => l.text).join(''));
  const e = eng.current;
  const lines = useRef<Line[]>(spec.lines.slice());
  const st = useRef({ idx: 0, start: 0, clean: true, chime: 0, fullFlow: 0, beats: 0, onBeat: 0, finished: false });
  const c = st.current;

  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [hint, setHint] = useState<Lang | 'caps' | null>(null);
  /** the OS keyboard is on the other layout, so keys are mapped by position */
  const remap = useRef(false);
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(spec.timeLimit ?? 0);
  const hintTimer = useRef(0);
  const beatMs = spec.bpm ? 60000 / spec.bpm : 0;

  const finish = () => {
    if (c.finished) return;
    c.finished = true;
    onFinish({
      mode: spec.mode, lang: spec.lang, lessonId: spec.lessonId, chapter: spec.chapter,
      ...summary(e),
      fullFlowMs: c.fullFlow,
      onBeat: c.beats ? c.onBeat / c.beats : undefined,
      typed: e.text.slice(0, e.pos),
      log: e.log,
      at: Date.now(),
    });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!started || !spec.timeLimit) return;
    const id = window.setInterval(() => {
      const remaining = spec.timeLimit! - (performance.now() - (e.startedAt ?? 0)) / 1000;
      setLeft(Math.max(0, Math.ceil(remaining)));
      if (remaining <= 0) finishRef.current();
    }, 200);
    return () => clearInterval(id);
  }, [started, spec.timeLimit, e]);

  useEffect(() => {
    if (!started || !beatMs) return;
    let n = 0;
    playTick(true);
    const id = window.setInterval(() => playTick(++n % 4 === 0), beatMs);
    return () => clearInterval(id);
  }, [started, beatMs]);

  useEffect(() => () => clearTimeout(hintTimer.current), []);

  useKeys((ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey || ev.repeat || c.finished) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (spec.more && e.pos >= 10) finish();
      else onAbort();
      return;
    }
    if (ev.key.length !== 1) return;
    ev.preventDefault();

    const flash = (h: Lang | 'caps') => {
      setHint(h);
      clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(null), 2500);
    };
    // Typing should work whichever layout the OS is on: when letters arrive in the
    // other alphabet, read keys by their position instead.
    const lineLang = lines.current[c.idx].lang;
    const typedScript = scriptOf(ev.key);
    if (typedScript) remap.current = typedScript !== (lineLang === 'en' ? 'latin' : 'cyrillic');
    let key = ev.key;
    if (remap.current) key = translate(key, lineLang === 'en' ? 'ru' : 'en', lineLang) ?? key;
    const expected = e.text[e.pos];
    if (key !== expected && key.toLowerCase() === expected.toLowerCase() && ev.getModifierState?.('CapsLock')) flash('caps');

    const now = performance.now();
    const prevAt = e.lastAt;
    const res = press(e, key, now);
    if (res === 'ignored') return;
    if (res === 'mismatch') {
      flash(lineLang);
      return;
    }
    if (!started) setStarted(true);

    if (res === 'miss') {
      playMiss();
      c.clean = false;
      if (spec.maxMisses && e.misses >= spec.maxMisses) finish();
    } else {
      playKey(pack);
      if (e.flow >= 0.8 && prevAt !== null) c.fullFlow += Math.min(now - prevAt, 2000);
      if (beatMs && e.startedAt !== null) {
        const half = beatMs / 2;
        const phase = ((now - e.startedAt) % half) / half;
        c.beats++;
        if (Math.min(phase, 1 - phase) < 0.2) c.onBeat++;
      }
      const lineLen = lines.current[c.idx].text.length;
      if (e.pos >= c.start + lineLen) {
        if (c.clean) playChime(c.chime++);
        else c.chime = 0;
        c.clean = true;
        if (!e.done) {
          c.start += lineLen;
          c.idx++;
        }
      }
      if (spec.more && lines.current.length - c.idx < 3) {
        const more = spec.more();
        lines.current.push(...more);
        extend(e, more.map((l) => l.text).join(''));
      }
      if (e.done) finish();
    }
    onFlow(e.flow);
    bump();
  });

  const line = lines.current[c.idx];
  const next = lines.current[c.idx + 1];
  const col = e.pos - c.start;
  const hearts = spec.maxMisses ? '♡'.repeat(Math.max(0, spec.maxMisses - e.misses)) : '';

  return (
    <div className="typing">
      <div className="typing-head">
        <span>{spec.title}</span>
        {spec.timeLimit ? <span className="accent">{left}</span> : null}
        {hearts && <span className="accent">{hearts}</span>}
        {beatMs > 0 && <span className={`beat ${started ? 'go' : ''}`} style={{ animationDuration: `${beatMs}ms` }} />}
      </div>

      <div className="lines">
        <div className="line cur" key={c.idx}>
          <span className="caret" style={{ transform: `translateX(${col}ch)` }} />
          <LineView line={line} start={c.start} eng={e} />
        </div>
        <div className="line upcoming">{next?.text ?? ' '}</div>
      </div>

      <div className="flowbar"><i style={{ width: `${e.flow * 100}%` }} /></div>
      <div className="hint">{hint ? t(hint === 'caps' ? 'capsLock' : hint === 'ru' ? 'switchRu' : 'switchEn') : ' '}</div>

      {showKeyboard && <Keyboard lang={line.lang} next={e.text[e.pos]} />}
      <div className="foot">{t(spec.more ? 'escFinish' : 'escLeave')}</div>
    </div>
  );
}
