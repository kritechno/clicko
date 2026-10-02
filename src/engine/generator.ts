export type Rng = () => number;

export function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const pick = <T,>(r: Rng, a: T[]): T => a[Math.floor(r() * a.length)];

export function shuffle<T>(r: Rng, a: T[]): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Short groups of raw keys; `fresh` keys are favoured over `known` ones. */
export function drill(r: Rng, fresh: string[], known: string[] = [], groups = 14): string {
  const out: string[] = [];
  for (let g = 0; g < groups; g++) {
    const len = 2 + Math.floor(r() * 3);
    let w = '';
    for (let i = 0; i < len; i++) w += known.length && r() < 0.4 ? pick(r, known) : pick(r, fresh);
    out.push(w);
  }
  return out.join(' ');
}

const VOWELS = 'aeiouyаеёиоуыэюя';

/** Pronounceable-ish nonsense from the given letters. */
export function pseudo(r: Rng, letters: string[], n = 12, favour: string[] = []): string {
  const ls = letters.filter((c) => /[a-zа-яё]/i.test(c));
  const v = ls.filter((c) => VOWELS.includes(c));
  const c = ls.filter((x) => !VOWELS.includes(x));
  const fav = favour.filter((x) => ls.includes(x));
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const len = 3 + Math.floor(r() * 3);
    let w = '';
    let vowel = r() < 0.4;
    for (let j = 0; j < len; j++) {
      const pool = v.length && c.length ? (vowel ? v : c) : ls;
      const favPool = fav.filter((x) => pool.includes(x));
      w += favPool.length && r() < 0.45 ? pick(r, favPool) : pick(r, pool);
      vowel = !vowel;
    }
    out.push(w);
  }
  return out.join(' ');
}

export interface PickOpts {
  /** keys or bigrams to lean towards */
  weak?: string[];
  weakShare?: number;
}

export function pickWords(r: Rng, list: string[], n: number, opts: PickOpts = {}): string[] {
  const weak = opts.weak ?? [];
  const weakPool = weak.length ? list.filter((w) => weak.some((k) => w.includes(k))) : [];
  const share = opts.weakShare ?? 0;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const pool = weakPool.length && r() < share ? weakPool : list;
    let w = pick(r, pool);
    if (w === out[i - 1] && pool.length > 1) w = pick(r, pool);
    out.push(w);
  }
  return out;
}

/** Break at word boundaries; every line but the last keeps its trailing space. */
export function wrapLines(text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ').filter(Boolean)) {
    if (cur && cur.length + w.length > max) {
      lines.push(cur);
      cur = '';
    }
    cur += w + ' ';
  }
  if (cur) lines.push(cur.trimEnd());
  return lines;
}
