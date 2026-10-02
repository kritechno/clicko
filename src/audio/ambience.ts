import type { Lang } from '../engine/layout';

export interface Ambience {
  id: string;
  file: string;
  name?: string | Partial<Record<Lang, string>>;
}

const base = `${import.meta.env.BASE_URL}ambience/`;
let list: Ambience[] = [];
const els: Record<string, HTMLAudioElement> = {};
const wanted: Record<string, number> = {};
let allowed = false;

/** Reads public/ambience/manifest.json; every entry is a looping audio file with its own volume. */
export async function loadAmbience(): Promise<Ambience[]> {
  try {
    const res = await fetch(`${base}manifest.json`);
    const json = await res.json();
    const raw: Ambience[] = Array.isArray(json.ambiences) ? json.ambiences : [];
    list = raw
      .filter((a) => a && typeof a.file === 'string')
      .map((a) => ({ ...a, id: a.id ?? a.file.replace(/\.[^.]+$/, '') }));
  } catch {
    list = [];
  }
  list.forEach((a) => sync(a.id));
  return list;
}

export function ambienceName(a: Ambience, ui: Lang): string {
  if (typeof a.name === 'string') return a.name;
  return a.name?.[ui] ?? a.name?.en ?? a.id;
}

function sync(id: string) {
  const a = list.find((x) => x.id === id);
  const v = wanted[id] ?? 0;
  if (!allowed || !a) return;
  let el = els[id];
  if (!el) {
    if (v <= 0) return;
    el = els[id] = new Audio(base + a.file);
    el.loop = true;
  }
  el.volume = v;
  if (v > 0 && el.paused) void el.play().catch(() => {});
  if (v <= 0 && !el.paused) el.pause();
}

export function setAmbience(id: string, v: number) {
  wanted[id] = v;
  sync(id);
}

/** Call from the first keypress: browsers only allow audio after a user gesture. */
export function startAmbience() {
  if (allowed) return;
  allowed = true;
  list.forEach((a) => sync(a.id));
}
