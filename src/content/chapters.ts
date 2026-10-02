import type { Lang } from '../engine/layout';
import { drill, pick, pickWords, pseudo, rng, shuffle, type Rng } from '../engine/generator';
import { ALL_WORDS, WORDS, YO_WORDS } from './words';
import { PARAGRAPHS, QUOTES, SENTENCES } from './texts';

export type RoomItem =
  | 'lamp' | 'mug' | 'window' | 'plant' | 'shelf' | 'records' | 'lights' | 'cat' | 'armchair' | 'telescope';

type Kind = 'keys' | 'caps' | 'punct' | 'nums' | 'words' | 'sentences' | 'long';
type L10n = Record<Lang, string>;

export interface Chapter {
  id: number;
  kind: Kind;
  title: L10n;
  /** new keys this chapter introduces (key chapters only) */
  keys: L10n;
  item: RoomItem;
  lessons: L10n[];
}

const KEY_LESSONS: L10n[] = [
  { en: 'new keys', ru: 'новые клавиши' },
  { en: 'mixing in', ru: 'вперемешку' },
  { en: 'sound shapes', ru: 'слоги' },
  { en: 'real words', ru: 'слова' },
  { en: 'recital', ru: 'этюд' },
];
const RECITAL: L10n = { en: 'recital', ru: 'этюд' };
const none: L10n = { en: '', ru: '' };

export const CHAPTERS: Chapter[] = [
  { id: 1, kind: 'keys', title: { en: 'home row', ru: 'основной ряд' }, keys: { en: 'asdfjkl;', ru: 'фываолдж' }, item: 'lamp', lessons: KEY_LESSONS },
  { id: 2, kind: 'keys', title: { en: 'home row reach', ru: 'середина ряда' }, keys: { en: "gh'", ru: 'прэ' }, item: 'mug', lessons: KEY_LESSONS },
  { id: 3, kind: 'keys', title: { en: 'top row', ru: 'верхний ряд' }, keys: { en: 'qwertyuiop', ru: 'йцукенгшщзхъ' }, item: 'window', lessons: KEY_LESSONS },
  { id: 4, kind: 'keys', title: { en: 'bottom row', ru: 'нижний ряд' }, keys: { en: 'zxcvbnm,./', ru: 'ячсмитьбю.' }, item: 'plant', lessons: KEY_LESSONS },
  {
    id: 5, kind: 'caps', title: { en: 'capitals & shift', ru: 'заглавные и shift' }, keys: none, item: 'shelf',
    lessons: [{ en: 'capital letters', ru: 'заглавные буквы' }, { en: 'both shifts', ru: 'оба shift' }, { en: 'loud words', ru: 'буква ё' }, RECITAL],
  },
  {
    id: 6, kind: 'punct', title: { en: 'punctuation', ru: 'знаки препинания' }, keys: none, item: 'records',
    lessons: [{ en: 'comma and period', ru: 'запятая и точка' }, { en: 'questions', ru: 'вопросы' }, { en: 'quotes and dashes', ru: 'кавычки и тире' }, RECITAL],
  },
  {
    id: 7, kind: 'nums', title: { en: 'numbers & symbols', ru: 'цифры и символы' }, keys: none, item: 'lights',
    lessons: [{ en: 'digits', ru: 'цифры' }, { en: 'counting things', ru: 'считаем' }, { en: 'symbols', ru: 'символы' }, RECITAL],
  },
  {
    id: 8, kind: 'words', title: { en: 'common words', ru: 'частые слова' }, keys: none, item: 'cat',
    lessons: [{ en: 'top 50', ru: 'топ 50' }, { en: 'top 150', ru: 'топ 150' }, { en: 'wider', ru: 'шире' }, { en: 'with weak keys', ru: 'со слабыми клавишами' }],
  },
  {
    id: 9, kind: 'sentences', title: { en: 'sentences', ru: 'предложения' }, keys: none, item: 'armchair',
    lessons: [{ en: 'short lines', ru: 'короткие' }, { en: 'longer lines', ru: 'длиннее' }, { en: 'quiet thoughts', ru: 'тихие мысли' }, RECITAL],
  },
  {
    id: 10, kind: 'long', title: { en: 'long form', ru: 'длинные тексты' }, keys: none, item: 'telescope',
    lessons: [{ en: 'a paragraph', ru: 'абзац' }, { en: 'another one', ru: 'ещё один' }, { en: 'the long one', ru: 'самый длинный' }],
  },
];

export const lessonId = (lang: Lang, chapter: number, index: number) => `${lang}-${chapter}-${index}`;
export const chapterById = (id: number) => CHAPTERS[id - 1];

const isLetter = (c: string) => /[a-zа-яё]/i.test(c);
const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
const num = (r: Rng) => String(Math.floor(r() * (r() < 0.5 ? 100 : 1000)));

function knownBefore(lang: Lang, id: number): string[] {
  return CHAPTERS.filter((c) => c.id < id && c.kind === 'keys').flatMap((c) => [...c.keys[lang]]);
}

function punctuate(r: Rng, words: string[], marks: string[]): string {
  const out: string[] = [];
  let capNext = false;
  for (let w of words) {
    if (capNext) { w = cap(w); capNext = false; }
    if (r() < 0.4) {
      const m = pick(r, marks);
      if (m === '"' || m === "'") w = m + w + m;
      else if (m === '-') w = w + ' -';
      else {
        w += m;
        if ('.?!'.includes(m)) capNext = true;
      }
    }
    out.push(w);
  }
  return out.join(' ').replace(/ -$/, '');
}

function symbol(r: Rng, lang: Lang, words: string[]): string {
  const n = num(r);
  if (lang === 'en') return pick(r, [`@${pick(r, words)}`, `#${n}`, `$${n}`, `${n}%`]);
  const mm = String(Math.floor(r() * 60)).padStart(2, '0');
  return pick(r, [`№${n}`, `${n}%`, `${Math.floor(r() * 24)}:${mm}`, `${pick(r, words)};`]);
}

function keyLesson(r: Rng, lang: Lang, ch: Chapter, index: number): string {
  const fresh = [...ch.keys[lang]];
  const known = knownBefore(lang, ch.id);
  const freshLetters = fresh.filter(isLetter);
  const letters = [...known, ...fresh].filter(isLetter);
  const allowed = new Set(letters);
  const pool = ALL_WORDS[lang].filter((w) => [...w].every((c) => allowed.has(c)));
  const words = (n: number) =>
    pool.length >= 8 ? pickWords(r, pool, n, { weak: freshLetters, weakShare: 0.6 }).join(' ') : pseudo(r, letters, n, freshLetters);

  switch (index) {
    case 0: return drill(r, fresh, [], 14);
    case 1: return known.length ? drill(r, fresh, known, 16) : drill(r, fresh, [], 18);
    case 2: return pseudo(r, letters, 13, freshLetters);
    case 3: return words(15);
    default: {
      let text = words(20);
      if (fresh.includes('.')) text += '.';
      return text;
    }
  }
}

/** `weak` = this player's weak keys; later chapters lean on them a little. */
export function buildLesson(lang: Lang, chapter: number, index: number, seed: number, weak: string[] = []): string {
  const r = rng(seed);
  const ch = chapterById(chapter);
  const words = WORDS[lang];
  const adaptive = { weak, weakShare: 0.2 };
  const sent = SENTENCES[lang];

  switch (ch.kind) {
    case 'keys':
      return keyLesson(r, lang, ch, index);
    case 'caps':
      if (index === 0) return pickWords(r, words, 16, adaptive).map(cap).join(' ');
      if (index === 1) return pickWords(r, words, 18, adaptive).map((w) => (r() < 0.5 ? cap(w) : w)).join(' ');
      if (index === 2) {
        return lang === 'ru'
          ? pickWords(r, YO_WORDS, 16).map((w) => (r() < 0.3 ? cap(w) : w)).join(' ')
          : pickWords(r, words.filter((w) => w.length <= 4), 16).map((w) => (r() < 0.5 ? w.toUpperCase() : w)).join(' ');
      }
      return shuffle(r, sent.short).slice(0, 3).join(' ');
    case 'punct':
      if (index === 0) return punctuate(r, pickWords(r, words, 18, adaptive), [',', '.']);
      if (index === 1) return punctuate(r, pickWords(r, words, 18, adaptive), ['?', '!']);
      if (index === 2) return punctuate(r, pickWords(r, words, 18, adaptive), lang === 'en' ? ["'", '"', '-', ':'] : ['"', '-', ':', ';']);
      return shuffle(r, sent.long).slice(0, 3).join(' ');
    case 'nums': {
      const nouns = words.filter((w) => w.length > 3);
      if (index === 0) return Array.from({ length: 14 }, () => num(r)).join(' ');
      if (index === 1) return Array.from({ length: 10 }, () => `${num(r)} ${pick(r, nouns)}`).join(' ');
      if (index === 2) return Array.from({ length: 12 }, () => symbol(r, lang, nouns)).join(' ');
      return Array.from({ length: 10 }, (_, i) => (i % 2 ? symbol(r, lang, nouns) : `${num(r)} ${pick(r, nouns)}`)).join(' ');
    }
    case 'words':
      if (index === 0) return pickWords(r, words.slice(0, 50), 22, adaptive).join(' ');
      if (index === 1) return pickWords(r, words.slice(0, 150), 26, adaptive).join(' ');
      if (index === 2) return pickWords(r, words, 30, adaptive).join(' ');
      return pickWords(r, words, 30, { weak, weakShare: 0.5 }).join(' ');
    case 'sentences':
      if (index === 0) return shuffle(r, sent.short).slice(0, 3).join(' ');
      if (index === 1) return shuffle(r, sent.long).slice(0, 3).join(' ');
      if (index === 2) return shuffle(r, QUOTES[lang]).slice(0, 2).join(' ');
      return shuffle(r, [...sent.short, ...sent.long]).slice(0, 4).join(' ');
    case 'long':
      return PARAGRAPHS[lang][index % PARAGRAPHS[lang].length];
  }
}
