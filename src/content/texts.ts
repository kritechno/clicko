import type { Lang } from '../engine/layout';

// Only characters that exist on a standard keyboard layout: no long dashes, no curly quotes.

export const SENTENCES: Record<Lang, { short: string[]; long: string[] }> = {
  en: {
    short: [
      'The rain is soft tonight.',
      'Tea first, then the rest.',
      'Slow hands make clean lines.',
      'The lamp hums and the room is warm.',
      'One key at a time is enough.',
      'The cat sleeps by the window.',
      'Nothing here needs to be fast.',
      'Small steps still cover the road.',
    ],
    long: [
      'A quiet evening is a good place to practice something small.',
      'The record turns, the kettle clicks, and the page slowly fills.',
      'If a word goes wrong, breathe out and type it once again.',
      'Steady rhythm matters more than speed, and speed arrives on its own.',
      'Outside the city glows, but in here there is only the next letter.',
      'Every evening you return, the keys feel a little more like home.',
      'Let your fingers find the way while your eyes rest on the words.',
      'The best sessions are the ones you barely notice passing.',
    ],
  },
  ru: {
    short: [
      'Дождь сегодня тихий.',
      'Сначала чай, потом всё остальное.',
      'Спокойные руки пишут чисто.',
      'Лампа горит, и в комнате тепло.',
      'Одной клавиши за раз достаточно.',
      'Кот спит у окна.',
      'Здесь некуда спешить.',
      'Маленькие шаги тоже ведут вперёд.',
    ],
    long: [
      'Тихий вечер - хорошее время, чтобы учиться чему-то небольшому.',
      'Пластинка крутится, чайник щёлкает, а страница понемногу заполняется.',
      'Если слово не получилось, выдохни и набери его ещё раз.',
      'Ровный ритм важнее скорости, а скорость придёт сама.',
      'За окном светится город, а здесь есть только следующая буква.',
      'С каждым вечером клавиши становятся чуть более родными.',
      'Пусть пальцы сами находят дорогу, пока глаза отдыхают на словах.',
      'Лучшие занятия - те, что проходят почти незаметно.',
    ],
  },
};

export const QUOTES: Record<Lang, string[]> = {
  en: [
    'Rain on the window. The kettle begins to sing. Nothing else tonight.',
    'Old lamp, warm circle. The same desk, a new evening. Keys like quiet rain.',
    'The city exhales. Somewhere a train is leaving. Here, the tea is hot.',
    'Be gentle with slow days. They carry more than they show.',
    'A page is filled the way a cup is filled, a little at a time.',
    'You do not have to hurry to arrive.',
    'Late light on the shelf. Dust drifts through it like slow snow. The cat does not care.',
    'Practice is just returning, again and again, without a fuss.',
  ],
  ru: [
    'Дождь за окном. Чайник начинает петь. Больше ничего не нужно.',
    'Старая лампа, тёплый круг. Тот же стол, новый вечер. Клавиши как тихий дождь.',
    'Город выдыхает. Где-то уходит поезд. А здесь горячий чай.',
    'Будь бережнее к медленным дням. Они несут больше, чем кажется.',
    'Страница наполняется, как чашка, понемногу.',
    'Чтобы прийти, не обязательно спешить.',
    'Поздний свет на полке. Пыль летит в нём, как медленный снег. Коту всё равно.',
    'Практика - это просто возвращаться, снова и снова, без суеты.',
  ],
};

export const PARAGRAPHS: Record<Lang, string[]> = {
  en: [
    'The evening starts the same way every time. You switch on the lamp, set the mug down on the left, and wait for the room to settle. The rain has been falling since noon, and by now it sounds less like weather and more like company.',
    'There is a kind of attention that only shows up when nobody is asking for it. The hands move, the letters appear, and for a few minutes the usual noise steps back. It is not a big thing. It is just a small, clean space that you made yourself.',
    'Some nights the words come easily and some nights they do not, and both kinds of night count. What matters is the returning: the same chair, the same keys, the same slow record turning in the corner. Years from now you will not remember any single evening, only that there were many of them, and that they were quiet, and that they were yours.',
  ],
  ru: [
    'Вечер каждый раз начинается одинаково. Ты включаешь лампу, ставишь чашку слева и ждёшь, пока комната успокоится. Дождь идёт с полудня, и теперь он похож не на погоду, а на тихого собеседника.',
    'Есть особое внимание, которое приходит только тогда, когда его никто не требует. Руки двигаются, буквы появляются, и на несколько минут привычный шум отступает. Это не что-то большое. Это просто маленькое чистое место, которое ты сделал сам.',
    'Иногда слова приходят легко, иногда нет, и оба таких вечера считаются. Важно само возвращение: тот же стул, те же клавиши, та же пластинка медленно крутится в углу. Через годы ты не вспомнишь ни одного отдельного вечера, только то, что их было много, что они были тихими и что они были твоими.',
  ],
};

export const PLACEMENT: Record<Lang, string> = {
  en: 'The rain is soft tonight and the lamp is warm. Take your time, type at your usual pace, and let the words come as they are.',
  ru: 'Дождь сегодня тихий, а лампа тёплая. Не спеши, печатай в привычном темпе, и пусть слова идут так, как идут.',
};
