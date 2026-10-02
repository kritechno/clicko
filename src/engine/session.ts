import type { Lang } from './layout';
import type { KeyEvent } from './typing';

export type Mode = 'lesson' | 'placement' | 'flow' | 'sprint' | 'clean' | 'weak' | 'switch' | 'beat' | 'quotes';

export interface Line {
  text: string;
  lang: Lang;
}

export interface SessionSpec {
  mode: Mode;
  lang: Lang;
  title: string;
  lines: Line[];
  lessonId?: string;
  chapter?: number;
  index?: number;
  /** endless modes: supplies more lines, each ending with a space */
  more?: () => Line[];
  /** seconds */
  timeLimit?: number;
  maxMisses?: number;
  bpm?: number;
}

export interface SessionResult {
  mode: Mode;
  lang: Lang;
  lessonId?: string;
  chapter?: number;
  chars: number;
  ms: number;
  wpm: number;
  acc: number;
  misses: number;
  avgFlow: number;
  /** ms spent at flow >= 0.8 */
  fullFlowMs: number;
  /** 0..1, beat mode only */
  onBeat?: number;
  typed: string;
  log: KeyEvent[];
  at: number;
}
