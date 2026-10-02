import type { Lang } from './layout';
import { CHAPTERS, lessonId, type Chapter, type RoomItem } from '../content/chapters';

export interface LessonRec {
  notes: number;
  wpm: number;
  acc: number;
}
export type Lessons = Record<string, LessonRec>;

export interface Track {
  placed: boolean;
  placementWpm: number;
  /** chapter id the placement test put the player at */
  start: number;
}

export const MAX_LEVEL = 50;

/** Accuracy gates the rating; speed only matters for the third note. */
export function notesFor(acc: number, wpm: number, target: number): 1 | 2 | 3 {
  if (acc >= 0.97 && wpm >= target) return 3;
  if (acc >= 0.94) return 2;
  return 1;
}

export function xpFor(chars: number, acc: number, avgFlow: number): number {
  return Math.round(chars * acc * acc * (1 + 0.25 * avgFlow));
}

export const xpForLevel = (level: number) => Math.round(120 * Math.pow(level - 1, 1.7));

export function levelOf(xp: number): number {
  let l = 1;
  while (l < MAX_LEVEL && xp >= xpForLevel(l + 1)) l++;
  return l;
}

export function placementStart(wpm: number): number {
  if (wpm < 15) return 1;
  if (wpm <= 40) return 4;
  return 8;
}

/** A relaxed personal bar: 90% of the recent average, so a normal day can still earn three notes. */
export function targetWpm(recent: number[], placementWpm: number): number {
  const last = recent.slice(-10);
  const base = last.length ? last.reduce((a, b) => a + b, 0) / last.length : placementWpm;
  return Math.max(8, base * 0.9);
}

export function chapterDone(lessons: Lessons, lang: Lang, ch: Chapter): boolean {
  return ch.lessons.every((_, i) => (lessons[lessonId(lang, ch.id, i)]?.notes ?? 0) >= 1);
}

export function isUnlocked(lessons: Lessons, track: Track, lang: Lang, chapter: number, index: number): boolean {
  if (!track.placed) return false;
  if (chapter < track.start) return true;
  if (index > 0) return (lessons[lessonId(lang, chapter, index - 1)]?.notes ?? 0) >= 1;
  return chapter === track.start || chapterDone(lessons, lang, CHAPTERS[chapter - 2]);
}

export function nextLesson(lessons: Lessons, track: Track, lang: Lang): { chapter: number; index: number } | null {
  for (const ch of CHAPTERS) {
    if (ch.id < track.start) continue;
    for (let i = 0; i < ch.lessons.length; i++) {
      if (!lessons[lessonId(lang, ch.id, i)] && isUnlocked(lessons, track, lang, ch.id, i)) return { chapter: ch.id, index: i };
    }
  }
  return null;
}

/** An item is in the room once its chapter is finished, or skipped by placement, in any language. */
export function roomItems(lessons: Lessons, tracks: Record<Lang, Track>): RoomItem[] {
  const langs = (['en', 'ru'] as Lang[]).filter((l) => tracks[l].placed);
  return CHAPTERS.filter((ch) => langs.some((l) => ch.id < tracks[l].start || chapterDone(lessons, l, ch))).map((ch) => ch.item);
}
