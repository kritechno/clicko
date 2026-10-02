import { isMismatch } from './layout';

export interface KeyEvent {
  ch: string;
  /** ms since the previous correct key; 0 for the first key */
  ms: number;
  missed: boolean;
  prev: string | null;
}

export interface TypingState {
  text: string;
  pos: number;
  missedAt: boolean[];
  keystrokes: number;
  misses: number;
  startedAt: number | null;
  lastAt: number | null;
  /** 0..1, rises with steady accurate typing, dips on mistakes, never resets */
  flow: number;
  flowSum: number;
  avgInterval: number;
  curMissed: boolean;
  done: boolean;
  log: KeyEvent[];
}

export type PressResult = 'ok' | 'miss' | 'mismatch' | 'ignored';

export function createTyping(text: string): TypingState {
  return {
    text, pos: 0, missedAt: [], keystrokes: 0, misses: 0, startedAt: null, lastAt: null,
    flow: 0, flowSum: 0, avgInterval: 0, curMissed: false, done: text.length === 0, log: [],
  };
}

export function extend(s: TypingState, more: string) {
  s.text += more;
  if (more.length) s.done = false;
}

/** The cursor only advances on the correct key, so there is nothing to backspace. */
export function press(s: TypingState, ch: string, now: number): PressResult {
  if (s.done) return 'ignored';
  const expected = s.text[s.pos];
  if (ch !== expected) {
    if (isMismatch(expected, ch)) return 'mismatch';
    if (s.startedAt === null) { s.startedAt = now; s.lastAt = now; }
    s.keystrokes++;
    s.misses++;
    if (!s.curMissed) { s.curMissed = true; s.missedAt[s.pos] = true; }
    s.flow *= 0.75;
    return 'miss';
  }
  if (s.startedAt === null) { s.startedAt = now; s.lastAt = now; }
  const interval = now - (s.lastAt as number);
  s.log.push({ ch: expected, ms: s.pos === 0 ? 0 : interval, missed: s.curMissed, prev: s.pos > 0 ? s.text[s.pos - 1] : null });
  if (!s.curMissed) {
    const steady = s.avgInterval === 0 || (interval > s.avgInterval * 0.4 && interval < s.avgInterval * 2);
    s.flow = Math.min(1, s.flow + (steady ? 0.025 : 0.008));
  }
  if (s.pos > 0) s.avgInterval = s.avgInterval === 0 ? interval : s.avgInterval * 0.8 + interval * 0.2;
  s.keystrokes++;
  s.pos++;
  s.flowSum += s.flow;
  s.curMissed = false;
  s.lastAt = now;
  if (s.pos >= s.text.length) s.done = true;
  return 'ok';
}

export interface Summary {
  chars: number;
  ms: number;
  wpm: number;
  acc: number;
  misses: number;
  avgFlow: number;
}

export function summary(s: TypingState): Summary {
  const ms = s.startedAt !== null && s.lastAt !== null ? s.lastAt - s.startedAt : 0;
  return {
    chars: s.pos,
    ms,
    wpm: ms > 0 ? s.pos / 5 / (ms / 60000) : 0,
    acc: s.keystrokes > 0 ? (s.keystrokes - s.misses) / s.keystrokes : 1,
    misses: s.misses,
    avgFlow: s.pos > 0 ? s.flowSum / s.pos : 0,
  };
}
