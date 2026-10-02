export interface Track {
  file: string;
  title?: string;
  bpm?: number;
}

const base = `${import.meta.env.BASE_URL}music/`;
let tracks: Track[] = [];
let el: HTMLAudioElement | null = null;
let idx = 0;
let allowed = false;
let volume = 0;

/** Reads public/music/manifest.json; the app works fine with no tracks. */
export async function loadMusic(): Promise<Track[]> {
  try {
    const res = await fetch(`${base}manifest.json`);
    const json = await res.json();
    tracks = Array.isArray(json.tracks) ? json.tracks : [];
  } catch {
    tracks = [];
  }
  sync();
  return tracks;
}

function sync() {
  if (!allowed || !tracks.length) return;
  if (!el) {
    el = new Audio();
    el.addEventListener('ended', () => {
      idx = (idx + 1) % tracks.length;
      if (el) el.src = base + tracks[idx].file;
      sync();
    });
    el.src = base + tracks[idx].file;
  }
  el.volume = volume;
  if (volume > 0 && el.paused) void el.play().catch(() => {});
  if (volume <= 0 && !el.paused) el.pause();
}

export function setMusicVolume(v: number) {
  volume = v;
  sync();
}

export function startMusic() {
  allowed = true;
  sync();
}

export const trackCount = () => tracks.length;
export const currentBpm = () => tracks[idx]?.bpm ?? 75;
