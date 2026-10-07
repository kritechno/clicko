import { useId, type CSSProperties } from 'react';
import type { RoomItem } from '../content/chapters';
import type { Slot } from '../content/shop';
import { CatSprite, LampSprite, LAMP_COLORS, MugSprite, PlantSprite, PosterSprite } from './RoomSprites';

interface Props {
  items: RoomItem[];
  equipped: Record<Slot, string>;
  flow: number;
  candles: boolean[];
  stamps: number;
  postcards: number;
  label?: string;
}
const BOOKS = [18, 23, 16, 21, 25, 17, 20, 24, 15, 22, 19, 24];
const BUILDINGS = [[0, 49, 18], [17, 35, 22], [35, 58, 17], [51, 42, 26], [75, 68, 19], [92, 46, 22], [112, 55, 27]];

function WindowScene({ clear, clip }: { clear: boolean; clip: string }) {
  return <g className="room-item">
    <rect x="169" y="26" width="142" height="111" fill="var(--ink)" />
    <rect x="174" y="30" width="132" height="102" fill="var(--sky)" />
    <g clipPath={`url(#${clip})`}>
      <rect x="174" y="61" width="132" height="71" fill="var(--sky-light)" opacity="0.2" />
      <path d="M174 92 H185 V81 H199 V88 H212 V67 H221 V87 H230 V75 H245 V91 H256 V69 H268 V82 H282 V73 H295 V93 H306 V132 H174 Z" fill="var(--city-far)" />
      {clear && <g fill="var(--paper)">
        <path d="M277 39 H283 V41 H286 V48 H283 V51 H276 V49 H273 V42 H277 Z" opacity="0.8" />
        {[[187, 40], [208, 56], [246, 41], [260, 60], [297, 58]].map(([x, y], i) => <rect key={x} className="pixel-star" x={x} y={y} width="1" height="1" style={{ animationDelay: `${i * 1.7}s` }} />)}
      </g>}
      <g transform="translate(174 0)">
        {BUILDINGS.map(([x, h, w], i) => <g key={x}>
          <rect x={x} y={132 - h} width={w} height={h} fill={i % 2 ? 'var(--city-near)' : 'var(--city-far)'} />
          <rect x={x + 2} y={130 - h} width={w - 4} height="2" fill="var(--city-near)" />
          {Array.from({ length: Math.floor((h - 8) / 9) }, (_, r) => Array.from({ length: Math.floor((w - 4) / 6) }, (_, c) =>
            <rect key={`${r}-${c}`} x={x + 3 + c * 6} y={137 - h + r * 9} width="2" height="3"
              fill={(r * 3 + c + i) % 4 === 0 ? 'var(--window-lit)' : 'var(--sky-light)'} opacity={(r + c + i) % 3 ? 0.6 : 0.16} />
          ))}
          {i === 3 && <g className="city-sign"><rect x={x + w - 7} y={140 - h} width="4" height="16" fill="var(--rose)" /><path d={`M${x + w - 6} ${143 - h} v3 m0 3 v2 m0 2 v2`} stroke="var(--paper)" strokeWidth="1" /></g>}
        </g>)}
      </g>
      <g className="passing-light" fill="var(--window-lit)"><rect x="174" y="123" width="6" height="1" /><rect x="174" y="126" width="9" height="1" opacity="0.3" /></g>
      {!clear && <>
        <g className="pixel-rain" fill="var(--sky-light)">
          {Array.from({ length: 26 }, (_, i) => {
            const x = 175 + ((i * 29) % 128), y = 28 + ((i * 17) % 104);
            return <g key={i} opacity={i % 3 === 0 ? 0.65 : 0.3}><path d={`M${x} ${y} v3 h-1 v3 h-1 v2 h1 v-2 h1 v-3 h1 v-3 Z`} /><path d={`M${x} ${y - 104} v3 h-1 v3 h-1 v2 h1 v-2 h1 v-3 h1 v-3 Z`} /></g>;
          })}
        </g>
        <g className="glass-trail" fill="var(--sky-light)"><rect x="191" y="45" width="1" height="14" /><rect x="193" y="59" width="1" height="7" /><rect x="276" y="71" width="1" height="18" /></g>
      </>}
      <path d="M176 32 H193 L176 68 Z M279 32 H285 L244 132 H238 Z" fill="var(--sky-light)" opacity="0.09" />
    </g>
    <g fill="var(--wood)"><rect x="169" y="26" width="142" height="4" /><rect x="169" y="30" width="5" height="104" /><rect x="306" y="30" width="5" height="104" /><rect x="238" y="30" width="4" height="104" /><rect x="174" y="77" width="132" height="4" /></g>
    <g fill="var(--wood-light)"><rect x="170" y="27" width="139" height="1" /><rect x="170" y="30" width="1" height="102" /><rect x="239" y="30" width="1" height="103" /><rect x="174" y="78" width="132" height="1" /></g>
    <rect x="164" y="133" width="151" height="4" fill="var(--wood-light)" /><rect x="164" y="137" width="151" height="4" fill="var(--wood-dark)" /><rect x="167" y="141" width="148" height="3" fill="var(--ink)" opacity="0.4" />
    <path d="M154 25 H164 V36 H167 V95 H164 V130 H158 V111 H155 Z M311 25 H322 V62 H319 V113 H316 V132 H311 Z" fill="var(--curtain)" />
    <path d="M157 27 H160 V116 H157 Z M314 28 H317 V119 H314 Z" fill="var(--curtain-light)" /><path d="M153 23 H323 V25 H153 Z" fill="var(--metal)" />
  </g>;
}

export function Room({ items, equipped, flow, candles, stamps, postcards, label = 'A cozy pixel-art room' }: Props) {
  const id = useId().replace(/:/g, '');
  const clip = `window-${id}`;
  const has = (item: RoomItem) => items.includes(item);
  const lamp = LAMP_COLORS[equipped.lamp] ?? LAMP_COLORS.warm;
  const strength = Math.min(1, Math.max(0, flow));
  return <svg className="room" viewBox="0 0 480 240" role="img" aria-label={label} shapeRendering="crispEdges"
    style={{ '--lamp-color': lamp, '--lamp-strength': 0.62 + strength * 0.22 } as CSSProperties}>
    <defs><clipPath id={clip}><rect x="174" y="30" width="132" height="103" /></clipPath></defs>
    <rect width="480" height="240" fill="var(--ink)" /><rect x="5" y="5" width="470" height="180" fill="var(--wall)" />
    <rect x="5" y="5" width="470" height="7" fill="var(--wall-shadow)" /><rect x="5" y="12" width="470" height="1" fill="var(--wall-light)" /><rect x="5" y="13" width="6" height="171" fill="var(--wall-shadow)" /><rect x="468" y="13" width="7" height="171" fill="var(--wall-shadow)" />
    {/* Fixed texture never changes during typing or palette switches. */}
    <g fill="var(--wall-light)" opacity="0.23">{Array.from({ length: 85 }, (_, i) => <rect key={i} x={13 + ((i * 47) % 449)} y={16 + ((i * 31) % 163)} width={i % 4 === 0 ? 3 : 1} height="1" />)}</g>
    <g fill="var(--wall-shadow)" opacity="0.5">
      <path d="M12 76 H27 V77 H12 Z M22 79 H40 V80 H22 Z M418 112 H463 V113 H418 Z M435 115 H463 V116 H435 Z M19 160 H47 V161 H19 Z M346 51 H364 V52 H346 Z" />
      <path d="M366 13 V28 H368 V32 H370 V35 H371 V39 H370 V34 H368 V30 H366 Z M114 113 V123 H116 V128 H118 V134 H117 V128 H114 V117 Z" />
    </g>
    <rect x="5" y="173" width="470" height="11" fill="var(--wainscot)" /><rect x="5" y="171" width="470" height="2" fill="var(--wood-light)" opacity="0.35" /><rect x="5" y="183" width="470" height="4" fill="var(--wood-dark)" /><rect x="5" y="187" width="470" height="48" fill="var(--floor)" />
    <g fill="var(--floor-line)">
      {[196, 207, 220, 234].map(y => <rect key={y} x="5" y={y} width="470" height="1" />)}
      {[38, 147, 290, 406].map(x => <rect key={x} x={x} y="187" width="1" height="9" />)}
      {[78, 228, 365].map(x => <rect key={x} x={x} y="197" width="1" height="10" />)}
      {[42, 186, 326, 443].map(x => <rect key={x} x={x} y="208" width="1" height="12" />)}
      {[102, 253, 382].map(x => <rect key={x} x={x} y="221" width="1" height="13" />)}
    </g>
    <g fill="var(--wood-light)" opacity="0.16">{Array.from({ length: 28 }, (_, i) => <rect key={i} x={14 + ((i * 79) % 438)} y={190 + ((i * 13) % 42)} width={6 + (i % 4) * 3} height="1" />)}</g>

    {has('window') && <WindowScene clear={has('telescope')} clip={clip} />}
    {has('lights') && <g className="room-item">
      <path d="M11 15 H40 V17 H79 V20 H119 V22 H159 V23 H199 V22 H239 V19 H279 V17 H319 V15 H359 V16 H399 V18 H438 V16 H469" fill="none" stroke="var(--ink)" strokeWidth="1" />
      {[[31, 15], [71, 18], [111, 21], [151, 23], [191, 23], [231, 20], [271, 17], [311, 16], [351, 16], [391, 18], [431, 17], [462, 16]].map(([x, y], i) => <g key={x}>
        <rect x={x} y={y} width="1" height="4" fill="var(--metal)" />
        <g className="pixel-light" style={{ animationDelay: `${-i * 2.3}s` }} fill={['var(--accent)', 'var(--sage)', 'var(--rose)'][i % 3]}>
          <rect x={x - 2} y={y + 2} width="5" height="7" opacity="0.12" /><rect x={x - 1} y={y + 4} width="3" height="4" /><rect x={x} y={y + 5} width="1" height="2" fill="var(--paper)" />
        </g>
      </g>)}
    </g>}

    {/* Board, postcards and candles show actual saved progress. */}
    <rect x="31" y="36" width="77" height="53" fill="var(--ink)" /><rect x="32" y="37" width="75" height="51" fill="var(--wood)" /><rect x="35" y="40" width="69" height="45" fill="var(--cork)" />
    <g fill="var(--wood-dark)" opacity="0.3">{Array.from({ length: 22 }, (_, i) => <rect key={i} x={37 + (i * 17) % 65} y={42 + (i * 11) % 41} width="1" height="1" />)}</g>
    {Array.from({ length: Math.min(stamps, 18) }, (_, i) => <g key={i} className="room-item" transform={`translate(${39 + (i % 6) * 10} ${43 + Math.floor(i / 6) * 13})`}>
      <rect width="7" height="10" fill="var(--paper)" /><rect x="1" y="2" width="5" height="5" fill={['var(--accent)', 'var(--sage)', 'var(--rose)'][i % 3]} /><rect x="3" y="0" width="1" height="1" fill="var(--ink)" />
    </g>)}
    {Array.from({ length: Math.min(postcards, 4) }, (_, i) => <g key={i} transform={`translate(${114 + (i % 2) * 17} ${94 + Math.floor(i / 2) * 11})`}><rect width="15" height="9" fill="var(--paper)" /><rect x="1" y="1" width="7" height="7" fill="var(--sky-light)" /><rect x="10" y="3" width="4" height="1" fill="var(--wood)" /></g>)}
    <rect x="31" y="111" width="77" height="3" fill="var(--wood-light)" /><rect x="32" y="114" width="76" height="2" fill="var(--wood-dark)" />
    {candles.map((lit, i) => <g key={i}>
      <rect x={37 + i * 10} y="103" width="4" height="8" fill={lit ? 'var(--paper)' : 'var(--wood)'} /><rect x={40 + i * 10} y="104" width="1" height="7" fill="var(--wood-dark)" />
      {lit && <g transform={`translate(${38 + i * 10} 96)`}><g className="pixel-flame"><rect x="-2" y="-2" width="6" height="9" fill="var(--accent)" opacity="0.12" /><path d="M0 0 H1 V2 H2 V6 H-1 V2 H0 Z" fill="var(--accent)" /><rect y="3" width="1" height="3" fill="var(--paper)" /></g></g>}
    </g>)}
    <g className="room-item" transform="translate(117 49)"><PosterSprite kind={equipped.poster} /></g>

    {has('shelf') && <g className="room-item" transform="translate(0 21)">
      <rect x="345" y="34" width="105" height="4" fill="var(--wood-light)" /><rect x="347" y="38" width="101" height="3" fill="var(--wood-dark)" /><rect x="350" y="41" width="3" height="4" fill="var(--metal)" /><rect x="441" y="41" width="3" height="4" fill="var(--metal)" />
      {BOOKS.map((h, i) => <g key={i}><rect x={351 + i * 7} y={34 - h} width={i % 3 === 0 ? 6 : 5} height={h} fill={['var(--sage)', 'var(--rose)', 'var(--accent)', 'var(--metal)'][i % 4]} /><rect x={352 + i * 7} y={36 - h} width="1" height={h - 4} fill="var(--paper)" opacity="0.3" /><rect x={351 + i * 7} y="29" width="5" height="1" fill="var(--paper)" opacity="0.4" /></g>)}
      <rect x="346" y="78" width="105" height="4" fill="var(--wood-light)" /><rect x="348" y="82" width="101" height="3" fill="var(--wood-dark)" />
      <g transform="translate(354 63)"><rect width="18" height="15" fill="var(--wood)" /><rect x="2" y="2" width="14" height="11" fill="var(--poster)" /><path d="M4 11 V9 H7 V6 H10 V9 H14 V11 Z" fill="var(--sage)" /></g>
      <path d="M393 76 V66 H395 V62 H399 V66 H401 V76 H403 V78 H391 V76 Z" fill="var(--terra)" /><rect x="395" y="64" width="2" height="11" fill="var(--terra-light)" />
      <rect x="412" y="71" width="24" height="3" fill="var(--rose)" /><rect x="416" y="68" width="22" height="3" fill="var(--sage)" /><rect x="411" y="74" width="27" height="4" fill="var(--accent)" />
    </g>}

    {has('armchair') && <g className="room-item">
      <path d="M19 203 H112 V207 H116 V219 H112 V222 H18 V219 H14 V207 H19 Z" fill="var(--rug)" /><path d="M20 207 H110 V218 H20 Z" fill="none" stroke="var(--rug-light)" strokeWidth="1" />
      <path d="M27 155 V139 H31 V135 H69 V138 H74 V170 H25 V155 Z" fill="var(--seat-dark)" /><path d="M31 138 H67 V143 H70 V166 H28 V145 H31 Z" fill="var(--seat)" />
      <rect x="32" y="142" width="32" height="2" fill="var(--seat-light)" /><rect x="48" y="143" width="1" height="23" fill="var(--seat-dark)" opacity="0.4" />
      <path d="M21 160 H28 V174 H69 V160 H78 V180 H75 V183 H24 V180 H21 Z" fill="var(--seat)" />
      <rect x="28" y="168" width="42" height="7" fill="var(--seat-light)" /><rect x="24" y="181" width="51" height="4" fill="var(--seat-dark)" /><rect x="28" y="185" width="4" height="10" fill="var(--wood-dark)" /><rect x="67" y="185" width="4" height="10" fill="var(--wood-dark)" />
      <path d="M57 153 H72 V180 H69 V184 H59 V181 H57 Z" fill="var(--rose)" /><rect x="59" y="155" width="1" height="25" fill="var(--paper)" opacity="0.3" /><rect x="63" y="154" width="2" height="28" fill="var(--seat-dark)" opacity="0.3" />
      <rect x="85" y="174" width="25" height="4" fill="var(--wood-light)" /><rect x="88" y="178" width="3" height="21" fill="var(--wood)" /><rect x="104" y="178" width="3" height="21" fill="var(--wood)" /><rect x="90" y="170" width="16" height="3" fill="var(--paper)" /><rect x="88" y="167" width="19" height="3" fill="var(--sage)" />
    </g>}
    {has('plant') && <g className="room-item" transform="translate(101 136)"><rect x="10" y="48" width="27" height="3" fill="var(--ink)" opacity="0.4" /><PlantSprite kind={equipped.plant} /></g>}

    {/* Desk and chair are present from the first visit. */}
    <path d="M148 205 H316 V209 H152 V212 H308 V214 H150 V210 H145 Z" fill="var(--ink)" opacity="0.32" />
    <rect x="141" y="152" width="183" height="6" fill="var(--wood-dark)" /><rect x="140" y="150" width="183" height="4" fill="var(--wood)" /><rect x="140" y="149" width="183" height="2" fill="var(--wood-light)" />
    <rect x="147" y="158" width="7" height="40" fill="var(--wood)" /><rect x="148" y="158" width="1" height="38" fill="var(--wood-light)" /><rect x="148" y="196" width="7" height="3" fill="var(--wood-dark)" /><rect x="306" y="157" width="7" height="40" fill="var(--wood)" /><rect x="311" y="157" width="2" height="40" fill="var(--wood-dark)" />
    <rect x="279" y="158" width="28" height="17" fill="var(--wood-dark)" /><rect x="281" y="158" width="25" height="14" fill="var(--wood)" /><rect x="283" y="159" width="21" height="1" fill="var(--wood-light)" /><rect x="291" y="164" width="6" height="1" fill="var(--metal)" />
    <path d="M219 177 V159 H222 V157 H245 V159 H248 V177 H244 V192 H247 V195 H218 V192 H222 V177 Z" fill="var(--ink)" /><rect x="222" y="160" width="23" height="17" fill="var(--seat-dark)" /><rect x="223" y="161" width="21" height="2" fill="var(--seat)" /><rect x="219" y="180" width="29" height="4" fill="var(--seat)" /><rect x="231" y="185" width="3" height="17" fill="var(--metal)" /><path d="M221 203 H245 V205 H221 Z M220 205 H223 V207 H220 Z M243 205 H246 V207 H243 Z" fill="var(--ink)" />
    <rect x="209" y="123" width="46" height="26" fill="var(--ink)" /><rect x="211" y="125" width="42" height="21" fill="var(--metal)" /><rect x="213" y="127" width="38" height="17" fill="var(--monitor)" />
    <g className="monitor-lines" fill="var(--sky-light)" opacity="0.65"><rect x="218" y="132" width="12" height="1" /><rect x="232" y="132" width="6" height="1" /><rect x="218" y="135" width="20" height="1" opacity="0.5" /><rect x="218" y="138" width="9" height="1" /><rect x="229" y="138" width="12" height="1" opacity="0.5" /></g>
    <rect x="205" y="148" width="54" height="2" fill="var(--metal)" /><rect x="226" y="148" width="12" height="1" fill="var(--paper)" opacity="0.4" /><rect x="269" y="144" width="16" height="4" fill="var(--paper)" /><rect x="270" y="145" width="11" height="1" fill="var(--wood-light)" /><rect x="283" y="142" width="2" height="7" fill="var(--rose)" />
    {has('lamp') && <g className="room-item">
      <g className="lamp-light" fill={lamp}>
        <path d="M184 122 H193 V132 H198 V144 H205 V150 H160 V145 H167 V135 H176 V128 H184 Z" opacity="0.13" /><path d="M184 123 H191 V136 H195 V148 H169 V142 H176 V133 H184 Z" opacity="0.13" /><rect x="167" y="149" width="33" height="2" opacity="0.3" /><path d="M171 158 H191 V184 H198 V194 H163 V188 H168 V171 H171 Z" opacity="0.045" />
        {[[166, 140], [199, 147], [177, 127], [164, 148], [201, 144]].map(([x, y]) => <rect key={x} x={x} y={y} width="1" height="1" opacity="0.4" />)}
      </g>
      <g transform="translate(163 114)"><LampSprite kind={equipped.lamp} /></g>
      <g className="lamp-dust" fill="var(--paper)"><rect x="177" y="136" width="1" height="1" /><rect x="187" y="129" width="1" height="1" /><rect x="193" y="142" width="1" height="1" /></g>
    </g>}
    {has('mug') && <g className="room-item" transform="translate(294 131)"><MugSprite kind={equipped.mug} /></g>}
    {has('records') && <g className="room-item" transform="translate(346 130)">
      <rect x="0" y="24" width="71" height="5" fill="var(--wood-light)" /><rect x="2" y="29" width="67" height="3" fill="var(--wood-dark)" /><rect x="6" y="32" width="4" height="33" fill="var(--wood)" /><rect x="61" y="32" width="4" height="33" fill="var(--wood)" /><rect x="8" y="54" width="55" height="3" fill="var(--wood-dark)" />
      <path d="M10 18 H33 V54 H10 Z M13 21 H16 V53 H13 Z M23 20 H25 V53 H23 Z" fill="var(--rose)" opacity="0.7" /><rect x="12" y="23" width="1" height="27" fill="var(--paper)" />
      <rect x="5" y="9" width="61" height="14" fill="var(--ink)" /><rect x="7" y="10" width="57" height="10" fill="var(--metal)" /><rect x="8" y="20" width="54" height="2" fill="var(--wood)" />
      <path d="M16 7 H39 V8 H44 V11 H39 V13 H16 V12 H12 V9 H16 Z" fill="var(--ink)" /><rect x="22" y="9" width="12" height="2" fill="var(--wood-dark)" /><rect x="26" y="9" width="4" height="2" fill="var(--accent)" /><rect className="record-mark" x="15" y="9" width="4" height="1" fill="var(--paper)" opacity="0.3" />
      <path d="M54 9 H56 V12 H51 V13 H47 V12 H49 V11 H54 Z" fill="var(--paper)" /><rect x="56" y="17" width="3" height="1" fill="var(--accent)" />
      <path className="pixel-note" d="M53 -9 H55 V-3 H52 V-5 H53 Z M55 -9 H58 V-8 H55 Z" fill="var(--accent)" /><path className="pixel-note note-b" d="M64 -4 H66 V2 H63 V0 H64 Z M66 -4 H69 V-3 H66 Z" fill="var(--sage)" />
    </g>}
    {has('cat') && <g className="room-item" transform="translate(258 191)"><CatSprite kind={equipped.cat} /></g>}
    {has('telescope') && <g className="room-item" transform="translate(423 153)">
      <path d="M15 17 H18 V21 H16 V36 H14 V44 H11 V42 H13 V32 H14 V21 H12 V19 H15 Z M18 21 H20 V28 H22 V36 H25 V44 H22 V40 H20 V32 H18 Z M16 21 H18 V44 H16 Z" fill="var(--metal)" />
      <path d="M0 11 H5 V8 H11 V5 H17 V2 H24 V-1 H29 V6 H24 V9 H18 V12 H12 V15 H6 V17 H0 Z" fill="var(--sky-light)" /><path d="M1 14 H6 V12 H12 V9 H18 V6 H25 V4 H29 V6 H24 V9 H18 V12 H12 V15 H6 V17 H1 Z" fill="var(--metal)" /><rect x="26" y="0" width="3" height="5" fill="var(--paper)" />
    </g>}
    <path d="M0 0 H480 V5 H0 Z M0 5 H5 V235 H0 Z M475 5 H480 V235 H475 Z M0 235 H480 V240 H0 Z" fill="var(--ink)" /><rect x="5" y="235" width="470" height="1" fill="var(--wood-light)" opacity="0.3" />
  </svg>;
}
