import type { Lang } from '../engine/layout';
import type { SessionResult } from '../engine/session';
import { chapterDone, type Lessons, type Track } from '../engine/progress';
import { CHAPTERS, type RoomItem } from './chapters';

export interface StampCtx {
  r: SessionResult;
  notes: number;
  hour: number;
  lessons: Lessons;
  tracks: Record<Lang, Track>;
  counters: { yo: number; flowMs: number };
  candles: number;
  postcards: number;
  items: RoomItem[];
}

export interface Stamp {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  check: (c: StampCtx) => boolean;
}

const stamp = (id: string, en: string, ru: string, descEn: string, descRu: string, check: Stamp['check']): Stamp => ({
  id, name: { en, ru }, desc: { en: descEn, ru: descRu }, check,
});

const cleared = (c: StampCtx, lang: Lang) =>
  c.tracks[lang].placed && (c.tracks[lang].start > 1 || chapterDone(c.lessons, lang, CHAPTERS[0]));

const speed = (lang: Lang, wpm: number): Stamp =>
  stamp(
    `wpm-${lang}-${wpm}`,
    `${wpm} wpm · ${lang}`,
    `${wpm} сл/мин · ${lang}`,
    `reach ${wpm} wpm in ${lang === 'en' ? 'english' : 'russian'}`,
    `набрать ${wpm} слов в минуту на ${lang === 'en' ? 'английском' : 'русском'}`,
    (c) => c.r.lang === lang && c.r.mode !== 'switch' && c.r.chars >= 80 && c.r.acc >= 0.9 && c.r.wpm >= wpm,
  );

export const STAMPS: Stamp[] = [
  stamp('first-light', 'first light', 'первый свет', 'finish your first lesson', 'закончить первый урок', (c) => c.r.mode === 'lesson'),
  stamp('clean-page', 'clean page', 'чистая страница', 'a lesson with 100% accuracy', 'урок со 100% точностью', (c) => c.r.mode === 'lesson' && c.r.misses === 0),
  stamp('slow-smooth', 'slow is smooth', 'тише едешь', 'three notes without a single slip', 'три ноты без единой ошибки', (c) => c.notes === 3 && c.r.misses === 0),
  stamp('both-tongues', 'both hands, both tongues', 'два языка', 'clear the home row in english and russian', 'пройти основной ряд на английском и русском', (c) => cleared(c, 'en') && cleared(c, 'ru')),
  stamp('night-shift', 'night shift', 'ночная смена', 'a session after midnight', 'занятие после полуночи', (c) => c.hour < 5),
  stamp('steady', 'steady', 'ровно', '5 minutes in full flow', '5 минут в полном потоке', (c) => c.counters.flowMs >= 300000),
  stamp('polyglot', 'polyglot', 'полиглот', 'a switch session at 97%+', 'режим «переключение» с точностью 97%+', (c) => c.r.mode === 'switch' && c.r.chars >= 150 && c.r.acc >= 0.97),
  stamp('yo-moe', 'ё-moe', 'ё-моё', 'type 100 words with the letter ё', 'набрать 100 слов с буквой ё', (c) => c.counters.yo >= 100),
  stamp('week-of-candles', 'seven candles', 'семь свечей', 'light 7 candles', 'зажечь 7 свечей', (c) => c.candles >= 7),
  stamp('postcard', 'postcard', 'открытка', 'finish a weekly goal', 'выполнить недельную цель', (c) => c.postcards >= 1),
  stamp('full-room', 'home', 'дом', 'fill the whole room', 'обставить всю комнату', (c) => c.items.length >= CHAPTERS.length),
  ...[20, 30, 40, 60, 80, 100].flatMap((w) => [speed('en', w), speed('ru', w)]),
];
