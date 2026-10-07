import type { ShopItem } from '../content/shop';

// Shared artwork keeps shop previews and the equipped room consistent.
export const LAMP_COLORS: Record<string, string> = { warm: '#efbd79', rose: '#df92a0', mint: '#99c7ae' };
const MUG_COLORS: Record<string, string> = { cream: '#e5d8ba', sage: '#9bb89b', peach: '#dea388' };
const CAT_COLORS: Record<string, [string, string, string]> = {
  grey: ['#8c91a8', '#666b83', '#b5bbcb'], ginger: ['#d59a62', '#a96d48', '#efc892'], black: ['#464c62', '#292e43', '#737b92'],
};
export const PALETTE_COLORS: Record<string, [string, string, string, string]> = {
  dusk: ['#171d2b', '#353a50', '#e9b879', '#84aeb0'], morning: ['#e7decd', '#cbbba3', '#b67748', '#6e9483'],
  matcha: ['#182822', '#334a3a', '#d2cb8c', '#86b295'], sepia: ['#2a211e', '#514035', '#e0ae72', '#a6b58c'], midnight: ['#0f1728', '#26374f', '#90b9db', '#93bcb7'],
};

export function LampSprite({ kind }: { kind: string }) {
  const color = LAMP_COLORS[kind] ?? LAMP_COLORS.warm;
  return <g>
    <path d="M3 34 H18 V36 H1 V35 H3 Z" fill="var(--wood-dark)" />
    <rect x="4" y="33" width="13" height="1" fill="var(--wood-light)" />
    <path d="M8 33 V17 H10 V15 H12 V13 H14 V11 H16 V9 H18 V11 H16 V13 H14 V15 H12 V17 H10 V33 Z" fill="var(--metal)" />
    <path d="M17 3 H27 V5 H31 V13 H16 V11 H14 V7 H17 Z" fill="var(--ink)" />
    <path d="M18 4 H26 V6 H30 V11 H16 V8 H18 Z" fill={color} />
    <rect x="18" y="4" width="7" height="2" fill="var(--paper)" opacity="0.5" />
    <rect x="17" y="12" width="12" height="2" fill={color} className="lamp-bulb" />
    <rect x="21" y="14" width="5" height="1" fill="#ffe7b4" className="lamp-bulb" />
  </g>;
}

export function MugSprite({ kind, steam = true }: { kind: string; steam?: boolean }) {
  const color = MUG_COLORS[kind] ?? MUG_COLORS.cream;
  return <g>
    {steam && <g fill="var(--paper)">
      <path className="pixel-steam steam-a" d="M5 -3 V-6 H7 V-10 H5 V-13 H7 V-15 H8 V-11 H7 V-7 H6 V-3 Z" />
      <path className="pixel-steam steam-b" d="M11 -2 V-5 H13 V-8 H11 V-11 H12 V-14 H13 V-10 H14 V-6 H12 V-2 Z" />
    </g>}
    <path d="M15 3 H20 V5 H21 V11 H19 V13 H15 V10 H18 V6 H15 Z" fill={color} />
    <path d="M1 1 H16 V15 H14 V17 H3 V15 H1 Z" fill={color} />
    <rect x="1" y="1" width="15" height="3" fill="var(--paper)" opacity="0.55" />
    <rect x="3" y="2" width="11" height="2" fill="var(--wood-dark)" />
    <rect x="2" y="5" width="2" height="8" fill="var(--paper)" opacity="0.4" />
    <path d="M13 5 H16 V15 H14 V17 H3 V15 H13 Z" fill="var(--ink)" opacity="0.18" />
    <rect x="0" y="17" width="19" height="1" fill="var(--wood-dark)" />
  </g>;
}

export function PlantSprite({ kind }: { kind: string }) {
  return <g>
    <g className="plant-leaves">
      <path d="M20 32 V13 H22 V32 Z" fill="var(--leaf-dark)" />
      {kind === 'cactus' ? <>
        <path d="M17 6 H24 V8 H26 V32 H16 V8 H17 Z M8 16 H13 V25 H17 V29 H10 V27 H8 Z M26 22 H30 V13 H35 V25 H33 V27 H26 Z" fill="var(--leaf)" />
        <rect x="18" y="9" width="2" height="20" fill="var(--leaf-light)" />
        <path d="M24 8 H26 V30 H24 Z M33 16 H35 V24 H33 Z" fill="var(--leaf-dark)" />
        {[10, 17, 24].map(y => <rect key={y} x="21" y={y} width="1" height="2" fill="var(--paper)" />)}
      </> : kind === 'monstera' ? <>
        <path d="M18 13 V8 H21 V4 H29 V6 H32 V15 H28 V19 H23 V16 H20 V13 Z M15 20 H9 V18 H5 V11 H8 V8 H13 V10 H17 V17 Z M24 26 V19 H28 V16 H35 V18 H39 V25 H35 V28 H29 Z" fill="var(--leaf)" />
        <path d="M23 6 H25 V11 H27 V13 H24 V16 H22 V12 H20 V10 H23 Z M7 11 H9 V15 H12 V17 H9 V15 H7 Z M30 19 H32 V22 H36 V24 H32 V26 H30 Z" fill="var(--leaf-light)" />
        <path d="M27 9 H30 V11 H27 Z M9 8 H11 V12 H9 Z M33 16 H35 V21 H33 Z" fill="var(--wall)" />
      </> : <>
        <path d="M20 26 H16 V24 H12 V21 H8 V18 H6 V15 H10 V17 H14 V20 H18 V23 H20 Z M22 23 H26 V20 H30 V16 H34 V12 H37 V16 H34 V20 H30 V23 H26 V26 H22 Z M20 15 H17 V12 H14 V9 H12 V5 H15 V8 H18 V11 H20 Z M22 16 H25 V12 H28 V8 H30 V5 H33 V9 H30 V13 H26 V18 H22 Z M19 27 H13 V25 H8 V23 H3 V20 H8 V21 H13 V23 H19 Z" fill="var(--leaf)" />
        <path d="M21 13 V2 H23 V13 Z M10 17 H14 V18 H10 Z M29 18 H33 V19 H29 Z M14 9 H16 V10 H14 Z" fill="var(--leaf-light)" />
      </>}
    </g>
    <path d="M10 32 H32 V36 H30 V46 H28 V49 H14 V46 H12 V36 H10 Z" fill="var(--terra)" />
    <rect x="10" y="32" width="22" height="3" fill="var(--terra-light)" />
    <rect x="14" y="37" width="2" height="8" fill="var(--terra-light)" />
    <path d="M27 36 H30 V46 H28 V49 H16 V47 H27 Z" fill="var(--wood-dark)" opacity="0.4" />
  </g>;
}

export function CatSprite({ kind }: { kind: string }) {
  const [fur, shadow, light] = CAT_COLORS[kind] ?? CAT_COLORS.grey;
  return <g>
    <path d="M4 22 H42 V24 H2 V23 H4 Z" fill="var(--ink)" opacity="0.4" />
    <g className="cat-belly">
      <path d="M17 8 H31 V9 H36 V11 H39 V14 H41 V20 H38 V22 H14 V20 H11 V15 H14 V11 H17 Z" fill={fur} />
      <path d="M17 9 H30 V10 H34 V12 H18 Z" fill={light} />
      <path d="M37 15 H41 V20 H38 V22 H16 V20 H34 V19 H37 Z" fill={shadow} />
      {kind === 'ginger' && <path d="M24 9 H27 V14 H25 V12 H24 Z M31 10 H33 V15 H31 Z" fill={shadow} />}
    </g>
    <path className="cat-tail" d="M35 18 H43 V16 H45 V12 H47 V18 H45 V21 H37 V20 H35 Z" fill={shadow} />
    <path d="M6 10 H15 V12 H18 V20 H15 V22 H6 V20 H3 V14 H6 Z" fill={fur} />
    <path className="cat-ear" d="M5 13 V5 H7 V7 H9 V10 H12 V7 H14 V5 H15 V14 Z" fill={fur} />
    <path d="M6 8 H7 V11 H6 Z M13 8 H14 V11 H13 Z" fill="#d49798" />
    <rect x="5" y="16" width="4" height="1" fill={shadow} /><rect x="12" y="16" width="3" height="1" fill={shadow} />
    <rect x="9" y="18" width="2" height="1" fill="#d49798" />
    <path d="M7 20 H12 V22 H7 Z M17 20 H22 V22 H17 Z" fill={light} />
  </g>;
}

export function PosterSprite({ kind }: { kind: string }) {
  if (kind === 'none') return null;
  return <g>
    <rect width="30" height="39" fill="var(--ink)" /><rect x="1" y="1" width="28" height="37" fill="var(--wood-light)" /><rect x="3" y="3" width="24" height="33" fill="var(--poster)" />
    {kind === 'moon' && <>
      <path d="M13 8 H19 V10 H22 V19 H20 V22 H13 V20 H10 V12 H13 Z" fill="var(--paper)" />
      <path d="M18 7 H23 V17 H20 V19 H16 V17 H14 V11 H16 V9 H18 Z" fill="var(--poster)" />
      <rect x="7" y="10" width="1" height="1" fill="var(--paper)" /><rect x="22" y="25" width="1" height="1" fill="var(--paper)" />
    </>}
    {kind === 'wave' && <g fill="var(--sky-light)">
      <path d="M5 19 H8 V16 H11 V13 H16 V15 H19 V20 H24 V23 H17 V20 H14 V18 H11 V22 H5 Z" />
      <path d="M5 25 H10 V23 H15 V25 H20 V24 H24 V27 H19 V29 H14 V27 H9 V29 H5 Z" opacity="0.65" /><rect x="18" y="8" width="4" height="4" fill="var(--paper)" />
    </g>}
    {kind === 'sun' && <><path d="M12 11 H19 V13 H22 V20 H9 V13 H12 Z" fill="var(--accent)" /><path d="M5 22 H25 V24 H5 Z M7 27 H23 V28 H7 Z M10 31 H20 V32 H10 Z" fill="var(--accent)" opacity="0.6" /></>}
    <rect x="9" y="33" width="12" height="1" fill="var(--paper)" opacity="0.35" />
  </g>;
}

export function ShopPreview({ item }: { item: ShopItem }) {
  const p = PALETTE_COLORS[item.value];
  return <svg className="shop-preview" viewBox="0 0 48 48" aria-hidden="true" shapeRendering="crispEdges">
    {item.slot === 'lamp' && <g transform="translate(7 5)"><LampSprite kind={item.value} /></g>}
    {item.slot === 'mug' && <g transform="translate(14 20)"><MugSprite kind={item.value} steam={false} /></g>}
    {item.slot === 'plant' && <g transform="translate(4 0) scale(.9)"><PlantSprite kind={item.value} /></g>}
    {item.slot === 'cat' && <g transform="translate(1 13)"><CatSprite kind={item.value} /></g>}
    {item.slot === 'poster' && (item.value === 'none' ? <path d="M11 6 H37 V8 H13 V40 H37 V42 H11 Z" fill="var(--dim)" /> : <g transform="translate(9 4)"><PosterSprite kind={item.value} /></g>)}
    {item.slot === 'palette' && p && <>
      <rect x="5" y="7" width="38" height="34" fill={p[0]} /><rect x="8" y="10" width="32" height="22" fill={p[1]} /><rect x="21" y="13" width="11" height="12" fill={p[0]} />
      <rect x="13" y="27" width="23" height="3" fill={p[2]} /><rect x="14" y="21" width="3" height="6" fill={p[2]} /><rect x="12" y="19" width="6" height="3" fill={p[2]} /><rect x="34" y="21" width="3" height="6" fill={p[3]} /><rect x="8" y="34" width="32" height="4" fill={p[3]} opacity="0.35" />
    </>}
    {item.slot === 'sound' && <g fill="var(--accent)">
      {[10, 16, 22, 28, 34].map((x, n) => {
        const heights: Record<string, number[]> = { thock: [6, 12, 20, 12, 6], typewriter: [18, 8, 22, 10, 18], raindrop: [4, 10, 16, 22, 8], wooden: [10, 18, 8, 18, 10], piano: [8, 14, 22, 18, 12] };
        const h = (heights[item.value] ?? heights.thock)[n];
        return <rect key={x} x={x} y={24 - h / 2} width="3" height={h} />;
      })}<rect x="8" y="37" width="32" height="1" fill="var(--dim)" />
    </g>}
  </svg>;
}
