import type { Lang } from './layout';
import type { Mode } from './session';
import { hash, rng, shuffle } from './generator';

export type TaskType = 'chars' | 'accurate' | 'lessons' | 'weak' | 'flow' | 'sprint';

export interface Task {
  type: TaskType;
  lang?: Lang;
  goal: number;
  progress: number;
}

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** ISO week, e.g. 2026-W40 */
export function weekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

const parse = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Three small tasks, the same all day for a given date. */
export function dailyTasks(date: string, langs: Lang[], modes: Mode[]): Task[] {
  const r = rng(hash(date));
  const lang = langs[Math.floor(r() * langs.length)] ?? 'en';
  const rest: Task[] = [
    { type: 'accurate', goal: 1, progress: 0 },
    { type: 'lessons', goal: 2, progress: 0 },
    { type: 'flow', goal: 120, progress: 0 },
  ];
  if (modes.includes('weak')) rest.push({ type: 'weak', goal: 1, progress: 0 });
  if (modes.includes('sprint')) rest.push({ type: 'sprint', goal: 1, progress: 0 });
  return [{ type: 'chars', lang, goal: 300, progress: 0 }, ...shuffle(r, rest).slice(0, 2)];
}

export interface TaskInput {
  mode: Mode;
  lang: Lang;
  chars: number;
  acc: number;
  ms: number;
}

export function applySession(tasks: Task[], s: TaskInput): Task[] {
  return tasks.map((t) => {
    let add = 0;
    if (t.type === 'chars' && t.lang === s.lang) add = s.chars;
    else if (t.type === 'accurate' && s.mode === 'lesson' && s.acc >= 0.97) add = 1;
    else if (t.type === 'lessons' && s.mode === 'lesson') add = 1;
    else if (t.type === 'weak' && s.mode === 'weak') add = 1;
    else if (t.type === 'sprint' && s.mode === 'sprint') add = 1;
    else if (t.type === 'flow' && s.mode === 'flow') add = Math.round(s.ms / 1000);
    return add ? { ...t, progress: Math.min(t.goal, t.progress + add) } : t;
  });
}

export const taskDone = (t: Task) => t.progress >= t.goal;

/**
 * Consecutive lit days ending today or yesterday. One "ember" per week
 * quietly bridges a single missed day, so a gap never breaks the row.
 */
export function streak(candles: string[], today: string): number {
  const lit = new Set(candles);
  const earliest = candles.slice().sort()[0];
  if (!earliest) return 0;
  const d = parse(today);
  if (!lit.has(today)) d.setDate(d.getDate() - 1);
  const usedWeeks = new Set<string>();
  let count = 0;
  for (let i = 0; i < 3650; i++) {
    const key = dateKey(d);
    if (key < earliest) break;
    if (lit.has(key)) count++;
    else {
      const w = weekKey(d);
      if (usedWeeks.has(w)) break;
      usedWeeks.add(w);
    }
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function lastDays(today: string, n: number): string[] {
  const out: string[] = [];
  const d = parse(today);
  d.setDate(d.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    out.push(dateKey(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
