import type { Lang } from '../engine/layout';

const split = (s: string) => s.trim().split(/\s+/);

/** Roughly frequency-ordered, so slices give "top N". */
export const WORDS: Record<Lang, string[]> = {
  en: split(`
    the be to of and a in that have it for not on with he as you do at this but his by from they we say her she
    or an will my one all would there their what so up out if about who get which go me when make can like time
    no just him know take people into year your good some could them see other than then now look only come its
    over think also back after use two how our work first well way even new want because any these give day most
    us find here thing many tell very still try ask need feel become leave put mean keep let begin seem help talk
    turn start show hear play run move live believe hold bring happen write sit stand lose pay meet learn change
    lead watch follow stop speak read spend grow open walk win teach offer remember love consider appear buy wait
    serve send build stay fall cut reach remain small large long little own old right big high different next
    early young important few public same able house world school life hand part child eye woman place week case
    point night water room mother area money story fact month lot book word home side kind head friend father
    hour game line end city name letter paper music tea rain window light quiet soft slow warm sleep dream cloud
    river garden morning evening summer winter autumn spring coffee candle
  `),
  ru: split(`
    и в не на я что он с как это по но они к у же вы за бы так от все она его только да нет ты мы мне было вот
    был для уже если или когда ещё чтобы даже во со ли ну кто где там тут тоже очень может надо будет быть есть
    день время человек дело жизнь рука раз год слово место лицо друг глаз вопрос дом сторона страна мир случай
    голова ребёнок сила конец вид система часть город отец женщина земля вода работа голос утро вечер ночь окно
    дверь стол книга письмо чай дождь свет тихо снег лето зима осень весна река сад небо облако музыка кофе свеча
    сон мечта говорить знать сказать стать хотеть идти видеть думать жить делать смотреть дать работать любить
    понять сидеть стоять ждать писать читать слушать играть спать новый старый большой маленький хороший добрый
    тёплый тихий мягкий медленный первый другой каждый самый свой наш ваш мой твой один два три много мало сейчас
    потом всегда никогда здесь туда снова опять почти вместе после перед между через около далеко близко легко
    просто можно нужно
  `),
};

/** Extra short words so the first chapters can use real words early. */
export const EXTRA: Record<Lang, string[]> = {
  en: split(`
    as ask all fall sad lad dad add flask salad alas fad lass
    had has hall half glass gas gash flag shall dash lash sag flash glad
  `),
  ru: split(`
    вода два да ад лад вал дол жало ложа вдова овал вол довод жажда лава давала ода фа
    папа пора право правда дар пар жара эра провод продал подвал пожар радар парад вправо пол род рад оправа
  `),
};

export const YO_WORDS = split(`
  ёж ёлка всё её моё твоё ещё идёт поёт даёт берёт живёт зовёт несёт тёплый зелёный чёрный жёлтый мёд лёд полёт
  счёт актёр ковёр озёра звёзды слёзы пчёлы вперёд далёкий
`);

export const ALL_WORDS: Record<Lang, string[]> = {
  en: [...new Set([...WORDS.en, ...EXTRA.en])],
  ru: [...new Set([...WORDS.ru, ...EXTRA.ru])],
};
