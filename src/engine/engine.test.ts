import { describe, expect, it } from 'vitest';
import { isMismatch, keyFor, translate } from './layout';
import { createTyping, extend, press, summary } from './typing';
import { mergeKeys, weakKeys } from './stats';
import { rng, wrapLines, pickWords } from './generator';
import { isUnlocked, levelOf, nextLesson, notesFor, placementStart, roomItems, targetWpm, xpForLevel, type Track } from './progress';
import { applySession, dailyTasks, streak, weekKey } from './tasks';
import { buildLesson, CHAPTERS, lessonId } from '../content/chapters';

function type(text: string, msPerKey = 200) {
  const s = createTyping(text);
  [...text].forEach((ch, i) => press(s, ch, i * msPerKey));
  return s;
}

describe('typing', () => {
  it('measures wpm and accuracy', () => {
    const s = type('a'.repeat(51), 200); // 50 intervals = 10 s for 51 chars
    const r = summary(s);
    expect(s.done).toBe(true);
    expect(r.acc).toBe(1);
    expect(r.wpm).toBeCloseTo(51 / 5 / (10 / 60), 5);
  });

  it('does not advance on a wrong key and counts it once per keystroke', () => {
    const s = createTyping('ab');
    expect(press(s, 'x', 0)).toBe('miss');
    expect(press(s, 'y', 10)).toBe('miss');
    expect(s.pos).toBe(0);
    expect(press(s, 'a', 20)).toBe('ok');
    expect(press(s, 'b', 30)).toBe('ok');
    expect(summary(s).acc).toBe(0.5);
    expect(s.missedAt[0]).toBe(true);
    expect(s.log[0].missed).toBe(true);
  });

  it('treats the wrong alphabet as a layout mismatch, not an error', () => {
    const s = createTyping('да');
    expect(press(s, 'l', 0)).toBe('mismatch');
    expect(s.misses).toBe(0);
    expect(isMismatch('д', 'l')).toBe(true);
    expect(isMismatch('a', 'ф')).toBe(true);
    expect(isMismatch('a', 's')).toBe(false);
    expect(isMismatch('.', 'ю')).toBe(false);
  });

  it('flow rises with steady typing, dips on a miss, never hits zero', () => {
    const s = type('a'.repeat(30));
    const before = s.flow;
    expect(before).toBeGreaterThan(0.5);
    extend(s, 'b');
    press(s, 'x', 99999);
    expect(s.flow).toBeLessThan(before);
    expect(s.flow).toBeGreaterThan(0);
  });
});

describe('layout', () => {
  it('finds keys on both layouts', () => {
    expect(keyFor('en', 'a')).toEqual({ row: 2, col: 0, shift: false });
    expect(keyFor('ru', 'ф')).toEqual({ row: 2, col: 0, shift: false });
    expect(keyFor('ru', 'Ё')).toEqual({ row: 0, col: 0, shift: true });
    expect(keyFor('ru', ',')).toEqual({ row: 3, col: 9, shift: true });
    expect(keyFor('en', ' ')?.row).toBe(4);
  });

  it('maps a key to the same position on the other layout', () => {
    expect(translate('l', 'en', 'ru')).toBe('д');
    expect(translate('Д', 'ru', 'en')).toBe('L');
    expect(translate('/', 'en', 'ru')).toBe('.');
    expect(translate(' ', 'en', 'ru')).toBe(' ');
    expect(translate('№', 'en', 'ru')).toBeNull();
  });
});

describe('stats', () => {
  it('picks out slow and inaccurate keys', () => {
    const log = [];
    for (let i = 0; i < 20; i++) {
      log.push({ ch: 'a', ms: 150, missed: false, prev: null });
      log.push({ ch: 's', ms: 160, missed: false, prev: null });
      log.push({ ch: 'd', ms: 150, missed: false, prev: null });
      log.push({ ch: 'q', ms: 500, missed: false, prev: null });
      log.push({ ch: 'z', ms: 150, missed: i % 2 === 0, prev: null });
    }
    const weak = weakKeys(mergeKeys({}, log));
    expect(weak.slice(0, 2).sort()).toEqual(['q', 'z']);
    expect(weak).not.toContain('a');
  });
});

describe('generator', () => {
  it('wraps at word boundaries and keeps the text intact', () => {
    const text = 'one two three four five six seven eight nine ten';
    const lines = wrapLines(text, 12);
    expect(lines.join('')).toBe(text);
    expect(lines.slice(0, -1).every((l) => l.endsWith(' '))).toBe(true);
  });

  it('leans towards weak keys when asked', () => {
    const list = ['zoo', 'cat', 'dog', 'sun', 'map'];
    const words = pickWords(rng(1), list, 200, { weak: ['z'], weakShare: 0.8 });
    expect(words.filter((w) => w === 'zoo').length).toBeGreaterThan(120);
  });

  it('early key lessons only use keys taught so far', () => {
    for (let i = 0; i < 5; i++) {
      expect(buildLesson('en', 1, i, 42 + i)).toMatch(/^[asdfjkl; ]+$/);
      expect(buildLesson('ru', 1, i, 42 + i)).toMatch(/^[фываолдж ]+$/);
      expect(buildLesson('ru', 2, i, 7 + i)).toMatch(/^[фываолджпрэ ]+$/);
    }
  });

  it('every lesson builds non-empty text in both languages', () => {
    for (const lang of ['en', 'ru'] as const)
      for (const ch of CHAPTERS)
        ch.lessons.forEach((_, i) => expect(buildLesson(lang, ch.id, i, 5).length).toBeGreaterThan(20));
  });
});

describe('progress', () => {
  it('rates by accuracy first, speed only for the third note', () => {
    expect(notesFor(0.9, 80, 30)).toBe(1);
    expect(notesFor(0.94, 10, 30)).toBe(2);
    expect(notesFor(0.97, 29, 30)).toBe(2);
    expect(notesFor(0.97, 30, 30)).toBe(3);
  });

  it('levels and placement', () => {
    expect(levelOf(0)).toBe(1);
    expect(levelOf(xpForLevel(2))).toBe(2);
    expect(levelOf(1e9)).toBe(50);
    expect([placementStart(10), placementStart(25), placementStart(55)]).toEqual([1, 4, 8]);
    expect(targetWpm([], 40)).toBe(36);
    expect(targetWpm([20, 40], 99)).toBe(27);
  });

  it('unlocks lessons in order and opens skipped chapters', () => {
    const track: Track = { placed: true, placementWpm: 25, start: 4 };
    expect(isUnlocked({}, track, 'en', 2, 3)).toBe(true);
    expect(isUnlocked({}, track, 'en', 4, 0)).toBe(true);
    expect(isUnlocked({}, track, 'en', 4, 1)).toBe(false);
    expect(isUnlocked({}, track, 'en', 5, 0)).toBe(false);
    expect(nextLesson({}, track, 'en')).toEqual({ chapter: 4, index: 0 });
    const lessons = { [lessonId('en', 4, 0)]: { notes: 1, wpm: 20, acc: 0.9 } };
    expect(nextLesson(lessons, track, 'en')).toEqual({ chapter: 4, index: 1 });
  });

  it('room items come from skipped and finished chapters', () => {
    const none: Track = { placed: false, placementWpm: 0, start: 1 };
    const tracks = { en: { placed: true, placementWpm: 25, start: 4 }, ru: none };
    expect(roomItems({}, tracks)).toEqual(['lamp', 'mug', 'window']);
    const lessons = Object.fromEntries(CHAPTERS[3].lessons.map((_, i) => [lessonId('en', 4, i), { notes: 1, wpm: 1, acc: 1 }]));
    expect(roomItems(lessons, tracks)).toContain('plant');
  });
});

describe('tasks', () => {
  it('daily tasks are stable for a date and differ across dates', () => {
    const a = dailyTasks('2026-10-02', ['en', 'ru'], ['flow', 'weak', 'sprint']);
    expect(a).toEqual(dailyTasks('2026-10-02', ['en', 'ru'], ['flow', 'weak', 'sprint']));
    expect(a).toHaveLength(3);
    const days = ['2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'].map((d) => JSON.stringify(dailyTasks(d, ['en', 'ru'], ['flow', 'weak', 'sprint'])));
    expect(new Set([JSON.stringify(a), ...days]).size).toBeGreaterThan(1);
  });

  it('tracks progress and caps at the goal', () => {
    const tasks = [{ type: 'chars' as const, lang: 'ru' as const, goal: 300, progress: 0 }, { type: 'accurate' as const, goal: 1, progress: 0 }];
    const s = { mode: 'lesson' as const, lang: 'ru' as const, chars: 400, acc: 0.98, ms: 60000 };
    expect(applySession(tasks, s).map((t) => t.progress)).toEqual([300, 1]);
    expect(applySession(tasks, { ...s, lang: 'en', acc: 0.9 }).map((t) => t.progress)).toEqual([0, 0]);
  });

  it('streak survives one missed day per week', () => {
    expect(streak([], '2026-10-02')).toBe(0);
    expect(streak(['2026-09-30', '2026-10-01', '2026-10-02'], '2026-10-02')).toBe(3);
    expect(streak(['2026-09-30', '2026-10-01'], '2026-10-02')).toBe(2);
    expect(streak(['2026-09-29', '2026-10-01', '2026-10-02'], '2026-10-02')).toBe(3);
    expect(streak(['2026-09-28', '2026-10-01', '2026-10-02'], '2026-10-02')).toBe(2);
    expect(weekKey(new Date(2026, 9, 2))).toBe('2026-W40');
  });
});
