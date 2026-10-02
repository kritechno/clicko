import type { Lang } from '../engine/layout';

export type Slot = 'lamp' | 'mug' | 'plant' | 'cat' | 'poster' | 'sound' | 'palette';

export interface ShopItem {
  id: string;
  slot: Slot;
  /** what the slot is set to */
  value: string;
  price: number;
  name: Record<Lang, string>;
}

const item = (slot: Slot, value: string, price: number, en: string, ru: string): ShopItem => ({
  id: `${slot}-${value}`, slot, value, price, name: { en, ru },
});

export const SHOP: ShopItem[] = [
  item('lamp', 'warm', 0, 'warm lamp', 'тёплая лампа'),
  item('lamp', 'rose', 60, 'rose lamp', 'розовая лампа'),
  item('lamp', 'mint', 60, 'mint lamp', 'мятная лампа'),
  item('mug', 'cream', 0, 'cream mug', 'кремовая кружка'),
  item('mug', 'sage', 40, 'sage mug', 'шалфейная кружка'),
  item('mug', 'peach', 40, 'peach mug', 'персиковая кружка'),
  item('plant', 'fern', 0, 'fern', 'папоротник'),
  item('plant', 'cactus', 70, 'cactus', 'кактус'),
  item('plant', 'monstera', 70, 'monstera', 'монстера'),
  item('cat', 'grey', 0, 'grey cat', 'серый кот'),
  item('cat', 'ginger', 90, 'ginger cat', 'рыжий кот'),
  item('cat', 'black', 90, 'black cat', 'чёрный кот'),
  item('poster', 'none', 0, 'bare wall', 'пустая стена'),
  item('poster', 'moon', 50, 'moon poster', 'постер с луной'),
  item('poster', 'wave', 50, 'wave poster', 'постер с волной'),
  item('poster', 'sun', 50, 'sun poster', 'постер с солнцем'),
  item('sound', 'thock', 0, 'soft thock', 'мягкий «ток»'),
  item('sound', 'typewriter', 80, 'typewriter', 'печатная машинка'),
  item('sound', 'raindrop', 80, 'raindrop', 'капля'),
  item('sound', 'wooden', 80, 'wooden', 'дерево'),
  item('sound', 'piano', 120, 'muted piano', 'тихое пианино'),
  item('palette', 'dusk', 0, 'dusk', 'сумерки'),
  item('palette', 'morning', 0, 'morning', 'утро'),
  item('palette', 'matcha', 100, 'matcha', 'матча'),
  item('palette', 'sepia', 100, 'sepia', 'сепия'),
  item('palette', 'midnight', 100, 'midnight', 'полночь'),
];

export const SLOTS: { slot: Slot; name: Record<Lang, string> }[] = [
  { slot: 'lamp', name: { en: 'lamp', ru: 'лампа' } },
  { slot: 'mug', name: { en: 'mug', ru: 'кружка' } },
  { slot: 'plant', name: { en: 'plant', ru: 'растение' } },
  { slot: 'cat', name: { en: 'cat', ru: 'кот' } },
  { slot: 'poster', name: { en: 'poster', ru: 'постер' } },
  { slot: 'sound', name: { en: 'key sound', ru: 'звук клавиш' } },
  { slot: 'palette', name: { en: 'palette', ru: 'палитра' } },
];

export const DEFAULT_OWNED = SHOP.filter((i) => i.price === 0).map((i) => i.id);

export const DEFAULT_EQUIPPED: Record<Slot, string> = {
  lamp: 'warm', mug: 'cream', plant: 'fern', cat: 'grey', poster: 'none', sound: 'thock', palette: 'dusk',
};
