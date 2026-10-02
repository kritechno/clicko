import type { RoomItem } from '../content/chapters';
import type { Slot } from '../content/shop';

interface Props {
  items: RoomItem[];
  equipped: Record<Slot, string>;
  /** 0..1, brightens the lamp and thickens the rain */
  flow: number;
  /** last seven days, oldest first */
  candles: boolean[];
  stamps: number;
  postcards: number;
}

const LAMP: Record<string, string> = { warm: '#f2c38b', rose: '#f0a7b0', mint: '#a8e0c0' };
const MUG: Record<string, string> = { cream: '#e8e1d3', sage: '#9db39a', peach: '#e6a57e' };
const CAT: Record<string, string> = { grey: '#8f8a99', ginger: '#d99a5b', black: '#3a3744' };
const BOOKS = [
  [0, 26, 'accent'], [12, 32, 'sage'], [24, 22, 'rose'], [36, 30, 'dim'], [52, 26, 'accent'], [64, 34, 'sage'],
  [80, 24, 'rose'], [96, 30, 'dim'], [108, 28, 'accent'], [124, 22, 'sage'],
] as const;

function Plant({ kind }: { kind: string }) {
  if (kind === 'cactus') {
    return (
      <g fill="var(--sage)">
        <rect x="183" y="206" width="14" height="40" rx="7" />
        <rect x="171" y="218" width="9" height="20" rx="4.5" />
        <rect x="200" y="212" width="9" height="22" rx="4.5" />
        <rect x="176" y="230" width="10" height="6" />
        <rect x="194" y="226" width="10" height="6" />
      </g>
    );
  }
  if (kind === 'monstera') {
    return (
      <g fill="var(--sage)">
        <ellipse cx="174" cy="218" rx="16" ry="11" transform="rotate(-25 174 218)" />
        <ellipse cx="206" cy="214" rx="17" ry="11" transform="rotate(20 206 214)" />
        <ellipse cx="190" cy="198" rx="12" ry="16" />
        <path d="M190 246 V206" stroke="var(--sage)" strokeWidth="2" />
      </g>
    );
  }
  return (
    <g fill="none" stroke="var(--sage)" strokeWidth="3" strokeLinecap="round">
      <path d="M190 246 Q186 214 166 204" />
      <path d="M190 246 Q190 208 190 192" />
      <path d="M190 246 Q196 214 216 206" />
      <path d="M190 246 Q180 226 162 228" />
      <path d="M190 246 Q202 226 220 230" />
    </g>
  );
}

function Poster({ kind }: { kind: string }) {
  if (kind === 'none') return null;
  return (
    <g className="item">
      <rect x="216" y="52" width="60" height="80" rx="2" fill="var(--surface)" stroke="var(--dim)" strokeWidth="1" />
      {kind === 'moon' && (
        <>
          <circle cx="246" cy="86" r="16" fill="var(--text)" opacity="0.85" />
          <circle cx="253" cy="81" r="14" fill="var(--surface)" />
        </>
      )}
      {kind === 'wave' && (
        <g fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M224 84 q7 -10 14 0 t14 0 t14 0" />
          <path d="M224 98 q7 -10 14 0 t14 0 t14 0" opacity="0.7" />
          <path d="M224 112 q7 -10 14 0 t14 0 t14 0" opacity="0.4" />
        </g>
      )}
      {kind === 'sun' && (
        <>
          <circle cx="246" cy="98" r="15" fill="var(--accent)" />
          <rect x="216" y="100" width="60" height="32" fill="var(--surface)" />
          <path d="M224 100 H268" stroke="var(--dim)" strokeWidth="1.5" />
        </>
      )}
    </g>
  );
}

export function Room({ items, equipped, flow, candles, stamps, postcards }: Props) {
  const has = (i: RoomItem) => items.includes(i);
  const lamp = LAMP[equipped.lamp] ?? LAMP.warm;
  const clear = has('telescope');

  return (
    <svg className="room" viewBox="0 0 800 340" role="img" aria-label="room">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor={lamp} stopOpacity="0.75" />
          <stop offset="1" stopColor={lamp} stopOpacity="0" />
        </radialGradient>
        <clipPath id="pane">
          <rect x="313" y="43" width="174" height="134" />
        </clipPath>
      </defs>

      <rect width="800" height="340" fill="var(--wall)" />
      <rect y="272" width="800" height="68" fill="var(--floor)" />
      <path d="M0 272 H800" stroke="var(--line)" strokeWidth="2" />

      {has('lights') && (
        <g className="item">
          <path d="M0 14 Q200 54 400 22 T800 14" fill="none" stroke="var(--dim)" strokeWidth="1" />
          {[[60, 24], [130, 32], [200, 36], [270, 34], [340, 27], [460, 20], [530, 22], [600, 22], [670, 20], [740, 17]].map(([x, y], i) => (
            <circle key={i} className="twinkle" style={{ animationDelay: `${(i % 5) * 0.7}s` }} cx={x} cy={y + 4} r="3.5"
              fill={['var(--accent)', 'var(--sage)', 'var(--rose)'][i % 3]} />
          ))}
        </g>
      )}

      {has('window') && (
        <g className="item">
          <rect x="310" y="40" width="180" height="140" rx="3" fill="var(--sky)" />
          <g clipPath="url(#pane)">
            {clear && (
              <>
                <circle cx="452" cy="72" r="13" fill="var(--text)" opacity="0.9" />
                {[[330, 60], [352, 96], [384, 58], [406, 84], [432, 118], [368, 128], [470, 108], [340, 140]].map(([x, y], i) => (
                  <circle key={i} className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} cx={x} cy={y} r="1.4" fill="var(--text)" />
                ))}
              </>
            )}
            <path d="M313 177 V150 h18 v-14 h22 v20 h16 v-30 h20 v24 h24 v-12 h18 v18 h20 v-26 h18 v34 h18 v14 Z" fill="var(--wall)" opacity="0.75" />
            {!clear && (
              <g className="rain" style={{ opacity: 0.35 + 0.5 * flow }} stroke="var(--text)" strokeWidth="1" strokeLinecap="round">
                {Array.from({ length: 22 }, (_, i) => {
                  const x = 318 + ((i * 37) % 168), y = (i * 53) % 150;
                  return <path key={i} d={`M${x} ${y} l-3 12 M${x} ${y + 150} l-3 12`} opacity={0.3 + (i % 3) * 0.2} />;
                })}
              </g>
            )}
          </g>
          <rect x="310" y="40" width="180" height="140" rx="3" fill="none" stroke="var(--wood)" strokeWidth="6" />
          <path d="M400 40 V180 M310 110 H490" stroke="var(--wood)" strokeWidth="3" />
          <rect x="302" y="180" width="196" height="7" rx="2" fill="var(--wood)" />
        </g>
      )}

      {/* corkboard with stamps, and the candle ledge under it */}
      <rect x="50" y="56" width="130" height="86" rx="3" fill="var(--wood)" opacity="0.5" />
      {Array.from({ length: Math.min(stamps, 18) }, (_, i) => (
        <g key={i} className="item" transform={`translate(${58 + (i % 6) * 20} ${63 + Math.floor(i / 6) * 26}) rotate(${(i % 3) - 1})`}>
          <rect width="15" height="19" rx="1" fill="var(--text)" opacity="0.9" />
          <rect x="2" y="2" width="11" height="11" fill={['var(--accent)', 'var(--sage)', 'var(--rose)', 'var(--dim)'][i % 4]} />
        </g>
      ))}
      {Array.from({ length: Math.min(postcards, 4) }, (_, i) => (
        <rect key={i} className="item" x={188 + (i % 2) * 4} y={60 + i * 20} width="22" height="15" rx="1"
          fill="var(--accent)" opacity="0.75" transform={`rotate(${i % 2 ? 4 : -5} ${199} ${68 + i * 20})`} />
      ))}
      <rect x="50" y="186" width="130" height="4" rx="1" fill="var(--wood)" />
      {candles.map((lit, i) => (
        <g key={i}>
          <rect x={58 + i * 17} y="172" width="6" height="14" rx="1" fill="var(--text)" opacity={lit ? 0.8 : 0.18} />
          {lit && <ellipse className="flame" cx={61 + i * 17} cy="167" rx="2.4" ry="4.2" fill="var(--accent)" />}
        </g>
      ))}

      <Poster kind={equipped.poster} />

      {has('shelf') && (
        <g className="item">
          <rect x="590" y="110" width="168" height="5" rx="1" fill="var(--wood)" />
          {BOOKS.map(([x, h, c], i) => (
            <rect key={i} x={600 + x} y={110 - h} width="10" height={h} rx="1" fill={`var(--${c})`} opacity="0.85" />
          ))}
        </g>
      )}

      {has('armchair') && (
        <g className="item">
          <ellipse cx="400" cy="312" rx="250" ry="17" fill="var(--rose)" opacity="0.22" />
          <rect x="36" y="200" width="88" height="62" rx="16" fill="var(--sage)" opacity="0.75" />
          <rect x="28" y="238" width="104" height="30" rx="10" fill="var(--sage)" />
          <rect x="38" y="266" width="6" height="10" fill="var(--wood)" />
          <rect x="116" y="266" width="6" height="10" fill="var(--wood)" />
        </g>
      )}

      {has('plant') && (
        <g className="item">
          <Plant kind={equipped.plant} />
          <path d="M174 244 H206 L201 274 H179 Z" fill="var(--accent)" opacity="0.85" />
        </g>
      )}

      {/* desk: always there */}
      <rect x="230" y="228" width="340" height="9" rx="2" fill="var(--wood)" />
      <rect x="244" y="237" width="8" height="38" fill="var(--wood)" />
      <rect x="548" y="237" width="8" height="38" fill="var(--wood)" />
      <rect x="372" y="200" width="56" height="26" rx="2" fill="var(--surface)" stroke="var(--dim)" strokeWidth="1" />
      <rect x="362" y="225" width="76" height="3" rx="1" fill="var(--dim)" />

      {has('lamp') && (
        <g className="item">
          <circle cx="298" cy="204" r="92" fill="url(#glow)" style={{ opacity: 0.3 + 0.7 * flow, transition: 'opacity 600ms ease' }} />
          <ellipse cx="270" cy="227" rx="14" ry="3" fill="var(--dim)" />
          <path d="M270 226 V192 L290 174" fill="none" stroke="var(--dim)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M280 162 L306 172 L298 190 L272 180 Z" fill={lamp} />
        </g>
      )}

      {has('mug') && (
        <g className="item">
          <rect x="500" y="210" width="16" height="18" rx="3" fill={MUG[equipped.mug] ?? MUG.cream} />
          <path d="M516 214 q8 4 0 10" fill="none" stroke={MUG[equipped.mug] ?? MUG.cream} strokeWidth="2.5" />
          <path className="steam" d="M505 204 q-4 -6 0 -12 t0 -10" fill="none" stroke="var(--text)" strokeWidth="1.2" strokeLinecap="round" />
          <path className="steam" style={{ animationDelay: '1.6s' }} d="M511 204 q4 -6 0 -12 t0 -10" fill="none" stroke="var(--text)" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {has('records') && (
        <g className="item">
          <rect x="606" y="238" width="88" height="6" rx="1" fill="var(--wood)" />
          <rect x="614" y="244" width="6" height="31" fill="var(--wood)" />
          <rect x="680" y="244" width="6" height="31" fill="var(--wood)" />
          <rect x="618" y="222" width="64" height="16" rx="3" fill="var(--surface)" stroke="var(--dim)" strokeWidth="1" />
          <ellipse cx="646" cy="221" rx="22" ry="4.5" fill="#15141a" />
          <ellipse cx="646" cy="221" rx="6" ry="1.4" fill="var(--accent)" />
          <text className="note" x="664" y="208" fontSize="13" fill="var(--text)">♪</text>
          <text className="note" style={{ animationDelay: '2s' }} x="678" y="212" fontSize="10" fill="var(--text)">♫</text>
        </g>
      )}

      {has('cat') && (
        <g className="item">
          <g className="breathe" fill={CAT[equipped.cat] ?? CAT.grey}>
            <ellipse cx="452" cy="300" rx="26" ry="12" />
            <circle cx="428" cy="293" r="9.5" />
            <path d="M420 288 l2 -9 l6 6 Z M430 284 l5 -7 l3 9 Z" />
            <path d="M476 302 q18 2 14 -12" fill="none" stroke={CAT[equipped.cat] ?? CAT.grey} strokeWidth="4.5" strokeLinecap="round" />
          </g>
        </g>
      )}

      {has('telescope') && (
        <g className="item" stroke="var(--dim)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M748 240 L736 276 M748 240 L762 276 M748 240 V276" />
          <rect x="722" y="222" width="52" height="11" rx="3" fill="var(--surface)" transform="rotate(-28 748 228)" />
        </g>
      )}
    </svg>
  );
}
