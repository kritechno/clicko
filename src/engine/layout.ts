export type Lang = 'en' | 'ru';
export type Script = 'latin' | 'cyrillic';

export interface KeyDef {
  en: string;
  enS: string;
  ru: string;
  ruS: string;
  /** 0-3 left pinky..index, 5-8 right index..pinky */
  finger: number;
}

function row(en: string, enS: string, ru: string, ruS: string, fingers: number[]): KeyDef[] {
  const a = [...en], b = [...enS], c = [...ru], d = [...ruS];
  return a.map((ch, i) => ({ en: ch, enS: b[i], ru: c[i], ruS: d[i], finger: fingers[i] }));
}

export const ROWS: KeyDef[][] = [
  row('`1234567890-=', '~!@#$%^&*()_+', 'ё1234567890-=', 'Ё!"№;%:?*()_+', [0, 0, 1, 2, 3, 3, 5, 5, 6, 7, 8, 8, 8]),
  row('qwertyuiop[]\\', 'QWERTYUIOP{}|', 'йцукенгшщзхъ\\', 'ЙЦУКЕНГШЩЗХЪ/', [0, 1, 2, 3, 3, 5, 5, 6, 7, 8, 8, 8, 8]),
  row("asdfghjkl;'", 'ASDFGHJKL:"', 'фывапролджэ', 'ФЫВАПРОЛДЖЭ', [0, 1, 2, 3, 3, 5, 5, 6, 7, 8, 8]),
  row('zxcvbnm,./', 'ZXCVBNM<>?', 'ячсмитьбю.', 'ЯЧСМИТЬБЮ,', [0, 1, 2, 3, 3, 5, 5, 6, 7, 8]),
];

export interface KeyPos {
  row: number;
  col: number;
  shift: boolean;
}

/** Where a character lives on the given layout. Space is row 4. */
export function keyFor(lang: Lang, ch: string): KeyPos | null {
  if (ch === ' ') return { row: 4, col: 0, shift: false };
  for (let r = 0; r < ROWS.length; r++) {
    for (let c = 0; c < ROWS[r].length; c++) {
      const k = ROWS[r][c];
      if ((lang === 'en' ? k.en : k.ru) === ch) return { row: r, col: c, shift: false };
      if ((lang === 'en' ? k.enS : k.ruS) === ch) return { row: r, col: c, shift: true };
    }
  }
  return null;
}

export function scriptOf(ch: string): Script | null {
  if (/[a-z]/i.test(ch)) return 'latin';
  if (/[а-яё]/i.test(ch)) return 'cyrillic';
  return null;
}

/** A letter from the wrong alphabet means the OS layout is wrong, not a typo. */
export function isMismatch(expected: string, typed: string): boolean {
  const a = scriptOf(expected), b = scriptOf(typed);
  return a !== null && b !== null && a !== b;
}

export function langOfChar(ch: string, fallback: Lang): Lang {
  const s = scriptOf(ch);
  return s === 'latin' ? 'en' : s === 'cyrillic' ? 'ru' : fallback;
}
