import type { KeyEvent } from './typing';

export interface KeyStat {
  hits: number;
  misses: number;
  /** total latency over hits, ms */
  ms: number;
}
export type KeyStats = Record<string, KeyStat>;

const isLetter = (c: string) => /[a-zа-яё]/i.test(c);

function add(stats: KeyStats, key: string, e: KeyEvent) {
  const s = stats[key] ?? { hits: 0, misses: 0, ms: 0 };
  // long pauses are thinking, not typing
  stats[key] = { hits: s.hits + 1, misses: s.misses + (e.missed ? 1 : 0), ms: s.ms + Math.min(e.ms, 2000) };
}

export function mergeKeys(stats: KeyStats, log: KeyEvent[], accept: (ch: string) => boolean = () => true): KeyStats {
  const out = { ...stats };
  for (const e of log) {
    if (e.ch === ' ' || e.ms === 0 || !accept(e.ch)) continue;
    add(out, e.ch.toLowerCase(), e);
  }
  return out;
}

export function mergeBigrams(stats: KeyStats, log: KeyEvent[], accept: (ch: string) => boolean = () => true): KeyStats {
  const out = { ...stats };
  for (const e of log) {
    if (!e.prev || e.ms === 0 || !isLetter(e.ch) || !isLetter(e.prev) || !accept(e.ch)) continue;
    add(out, (e.prev + e.ch).toLowerCase(), e);
  }
  return out;
}

/** Keys that are inaccurate or slow relative to this player's own median. */
export function weakKeys(stats: KeyStats, n = 5, minHits = 8): string[] {
  const entries = Object.entries(stats).filter(([, s]) => s.hits >= minHits);
  if (entries.length < 3) return [];
  const avgs = entries.map(([, s]) => s.ms / s.hits).sort((a, b) => a - b);
  const median = avgs[Math.floor(avgs.length / 2)] || 1;
  return entries
    .map(([k, s]) => ({ k, score: (s.misses / s.hits) * 3 + Math.max(0, s.ms / s.hits / median - 1) }))
    .filter((x) => x.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.k);
}
