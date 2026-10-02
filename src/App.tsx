import { useEffect, useState } from 'react';
import type { Lang } from './engine/layout';
import type { SessionResult, SessionSpec } from './engine/session';
import { levelOf, nextLesson, roomItems, xpForLevel, MAX_LEVEL } from './engine/progress';
import { dateKey, lastDays, streak, taskDone, type Task } from './engine/tasks';
import { chapterById } from './content/chapters';
import { buildMode, lessonSpec, placementSpec, MODE_LIST, type ModeEntry } from './content/modes';
import { useSave, weakFor, WEEKLY_GOAL, type Rewards } from './store/save';
import { setKeysVolume, type SoundPack } from './audio/keys';
import { loadAmbience, setAmbience, startAmbience, type Ambience } from './audio/ambience';
import { currentBpm, loadMusic, setMusicVolume, startMusic } from './audio/music';
import { titleFor, tr, type T } from './i18n';
import { Room } from './ui/Room';
import { Typing } from './ui/Typing';
import { Result } from './ui/Result';
import { BoardScreen, MapScreen, ModesScreen, SettingsScreen, ShopScreen } from './ui/Screens';
import { useKeys } from './ui/hooks';

type View = 'home' | 'typing' | 'result' | 'map' | 'modes' | 'shop' | 'board' | 'settings';
const MENU: View[] = ['map', 'modes', 'shop', 'board', 'settings'];

/** Characters per typing line, matched to the font-size clamp in styles.css. */
const lineWidth = () => (window.innerWidth < 560 ? 24 : window.innerWidth < 820 ? 34 : 46);

function taskText(t: T, task: Task): string {
  switch (task.type) {
    case 'chars': return t('taskChars', task.goal, t(task.lang === 'ru' ? 'inRu' : 'inEn'));
    case 'accurate': return t('taskAccurate');
    case 'lessons': return t('taskLessons', task.goal);
    case 'weak': return t('taskWeak');
    case 'flow': return t('taskFlow');
    case 'sprint': return t('taskSprint');
  }
}

function Welcome({ onPick }: { onPick: (langs: Lang[]) => void }) {
  useKeys((e) => {
    if (e.code === 'Digit1') onPick(['en']);
    else if (e.code === 'Digit2') onPick(['ru']);
    else if (e.code === 'Digit3') onPick(['en', 'ru']);
  });
  return (
    <div className="screen center">
      <h1>clicko</h1>
      <p>what would you like to practice?<br />что будем тренировать?</p>
      <div className="choices">
        <button onClick={() => onPick(['en'])}><kbd>1</kbd> english</button>
        <button onClick={() => onPick(['ru'])}><kbd>2</kbd> русский</button>
        <button onClick={() => onPick(['en', 'ru'])}><kbd>3</kbd> both / оба</button>
      </div>
    </div>
  );
}

export default function App() {
  const s = useSave();
  const ui = s.uiLang;
  const t = tr(ui);
  const [view, setView] = useState<View>('home');
  const [spec, setSpec] = useState<SessionSpec | null>(null);
  const [run, setRun] = useState(0);
  const [again, setAgain] = useState<(() => void) | null>(null);
  const [outcome, setOutcome] = useState<{ r: SessionResult; rw: Rewards } | null>(null);
  const [flow, setFlow] = useState(0);
  const [tracks, setTracks] = useState(0);
  const [ambiences, setAmbiences] = useState<Ambience[]>([]);

  const today = dateKey(new Date());
  const level = levelOf(s.xp);
  const track = s.tracks[s.lang];
  const upcoming = track.placed ? nextLesson(s.lessons, track, s.lang) : null;

  useEffect(() => {
    s.ensureDaily();
    void loadMusic().then((list) => setTracks(list.length));
    void loadAmbience().then(setAmbiences);
    const unlock = () => { startAmbience(); startMusic(); };
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dataset.palette = s.equipped.palette;
    document.documentElement.lang = ui;
  }, [s.equipped.palette, ui]);

  useEffect(() => {
    setKeysVolume(s.muted ? 0 : s.vol.keys);
    setMusicVolume(s.muted ? 0 : s.vol.music);
    for (const a of ambiences) setAmbience(a.id, s.muted ? 0 : s.vol[a.id] ?? 0);
  }, [s.muted, s.vol, ambiences]);

  // ---- starting sessions (always read fresh state: these run right after store updates)

  const begin = (make: () => SessionSpec) => {
    setSpec(make());
    setAgain(() => () => begin(make));
    setRun((n) => n + 1);
    setFlow(0);
    setView('typing');
  };
  const startPlacement = (lang: Lang) => begin(() => placementSpec(lang, lineWidth(), tr(useSave.getState().uiLang)('warmup')));
  const startLesson = (chapter: number, index: number) => {
    const st = useSave.getState();
    begin(() => lessonSpec(st.lang, chapter, index, weakFor(st, st.lang), lineWidth(), st.uiLang));
  };
  const startMode = (m: ModeEntry) => {
    const st = useSave.getState();
    begin(() => buildMode(m, st.lang, { weak: weakFor(st, st.lang), max: lineWidth(), bpm: currentBpm(), ui: st.uiLang }));
  };
  const goOn = () => {
    const st = useSave.getState();
    const unplaced = [st.lang, ...st.langs].find((l) => !st.tracks[l].placed);
    if (unplaced) {
      if (unplaced !== st.lang) st.setLang(unplaced);
      return startPlacement(unplaced);
    }
    const n = nextLesson(st.lessons, st.tracks[st.lang], st.lang);
    if (n) startLesson(n.chapter, n.index);
    else startMode(MODE_LIST[0]);
  };

  const home = () => { setView('home'); setFlow(0); };

  useKeys((e) => {
    if (view !== 'home' || !s.welcomed || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); goOn(); }
    else if (/^Digit[1-5]$/.test(e.code)) setView(MENU[Number(e.code.slice(5)) - 1]);
    else if (e.code === 'KeyL') s.setLang(s.lang === 'en' ? 'ru' : 'en');
    else if (e.code === 'KeyM') s.toggle('muted');
  });
  useKeys((e) => {
    if (view === 'settings' && e.code === 'KeyM') s.toggle('muted');
  });

  // ---- panel

  let panel: JSX.Element;
  if (!s.welcomed) {
    panel = <Welcome onPick={(langs) => { s.welcome(ui, langs); startPlacement(langs[0]); }} />;
  } else if (view === 'typing' && spec) {
    panel = (
      <Typing
        key={run}
        spec={spec}
        t={t}
        showKeyboard={s.showKeyboard}
        pack={s.equipped.sound as SoundPack}
        onFlow={setFlow}
        onFinish={(r) => { setOutcome({ r, rw: s.finish(r) }); setView('result'); }}
        onAbort={home}
      />
    );
  } else if (view === 'result' && outcome) {
    panel = <Result r={outcome.r} rw={outcome.rw} ui={ui} t={t} onNext={goOn} onRetry={() => again?.()} onHome={home} />;
  } else if (view === 'map') {
    panel = <MapScreen t={t} onStart={startLesson} onBack={home} />;
  } else if (view === 'modes') {
    panel = <ModesScreen t={t} onStart={startMode} onBack={home} />;
  } else if (view === 'shop') {
    panel = <ShopScreen t={t} onBack={home} />;
  } else if (view === 'board') {
    panel = <BoardScreen t={t} onBack={home} />;
  } else if (view === 'settings') {
    panel = <SettingsScreen t={t} tracks={tracks} ambiences={ambiences} onBack={home} />;
  } else {
    const from = xpForLevel(level), to = xpForLevel(level + 1);
    const pct = level >= MAX_LEVEL ? 100 : ((s.xp - from) / (to - from)) * 100;
    const nextText = !track.placed
      ? t('warmupNext')
      : upcoming
        ? `${chapterById(upcoming.chapter).title[ui]} · ${chapterById(upcoming.chapter).lessons[upcoming.index][ui]}`
        : t('allDone');
    panel = (
      <div className="screen home">
        <div className="home-top">
          <span>{t('level', level)} · {titleFor(ui, level)}</span>
          <span>{s.beans} ◦ {t('beans')}</span>
          <span>{t(s.lang === 'en' ? 'trackEn' : 'trackRu')}{s.muted ? ` · ${t('muted')}` : ''}</span>
        </div>
        <div className="xp"><i style={{ width: `${pct}%` }} /></div>

        <button className="go" onClick={goOn}>
          <small>{t('next')}</small>
          <b>{nextText}</b>
          <span><kbd>space</kbd> {t('continue')}</span>
        </button>

        <div className="tea">
          <h3>{t('teaList')}</h3>
          {s.daily.tasks.map((task, i) => (
            <div key={i} className={taskDone(task) ? 'done' : ''}>
              <span>{taskDone(task) ? '●' : '○'} {taskText(t, task)}</span>
              <span>{task.type === 'flow' ? `${Math.floor(task.progress / 60)}:${String(task.progress % 60).padStart(2, '0')}` : `${task.progress} / ${task.goal}`}</span>
            </div>
          ))}
          <p>
            {t('streak', streak(s.candles, today))} · {s.weekly.week && s.weekly.done ? t('weeklyDone') : t('weekly', s.weekly.chars, WEEKLY_GOAL)}
          </p>
        </div>

        <nav className="foot">
          {MENU.map((v, i) => (
            <button key={v} onClick={() => setView(v)}>
              <kbd>{i + 1}</kbd> {t((['lessons', 'modes', 'shop', 'stamps', 'settings'] as const)[i])}
            </button>
          ))}
          <button onClick={() => s.setLang(s.lang === 'en' ? 'ru' : 'en')}><kbd>L</kbd> {t('language')}</button>
        </nav>
      </div>
    );
  }

  return (
    <div className={`app view-${view}`}>
      <div className="room-wrap">
        <Room
          items={roomItems(s.lessons, s.tracks)}
          equipped={s.equipped}
          flow={view === 'typing' ? flow : 0.35}
          candles={lastDays(today, 7).map((d) => s.candles.includes(d))}
          stamps={Object.keys(s.stamps).length}
          postcards={s.postcards}
        />
      </div>
      <main className="panel">{panel}</main>
    </div>
  );
}
