import { keyFor, ROWS, type Lang } from '../engine/layout';

/** Small on-screen keyboard; the next key glows softly. */
export function Keyboard({ lang, next }: { lang: Lang; next: string | undefined }) {
  const pos = next ? keyFor(lang, next) : null;
  return (
    <div className="kb" aria-hidden>
      {ROWS.map((row, r) => (
        <div className="kb-row" key={r}>
          {r === 3 && <span className={`key wide ${pos?.shift ? 'on' : ''}`}>shift</span>}
          {row.map((k, c) => (
            <span key={c} className={`key ${pos && pos.row === r && pos.col === c ? 'on' : ''}`}>
              {lang === 'en' ? k.en : k.ru}
            </span>
          ))}
          {r === 3 && <span className={`key wide ${pos?.shift ? 'on' : ''}`}>shift</span>}
        </div>
      ))}
      <div className="kb-row">
        <span className={`key space ${pos?.row === 4 ? 'on' : ''}`} />
      </div>
    </div>
  );
}
