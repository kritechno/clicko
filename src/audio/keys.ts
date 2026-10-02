import { audio, whiteNoise } from './context';

export type SoundPack = 'thock' | 'typewriter' | 'raindrop' | 'wooden' | 'piano';

let out: GainNode | null = null;
let volume = 0.7;

function bus(): GainNode {
  const c = audio();
  if (!out) {
    out = c.createGain();
    out.connect(c.destination);
  }
  out.gain.value = volume;
  return out;
}

export function setKeysVolume(v: number) {
  volume = v;
  if (out) out.gain.value = v;
}

function envelope(g: GainNode, t: number, peak: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function tone(type: OscillatorType, from: number, to: number, peak: number, dur: number, lowpass?: number) {
  const c = audio(), t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  if (to !== from) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  envelope(g, t, peak, dur);
  let node: AudioNode = o;
  if (lowpass) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lowpass;
    o.connect(f);
    node = f;
  }
  node.connect(g).connect(bus());
  o.start(t);
  o.stop(t + dur + 0.02);
}

function burst(filter: BiquadFilterType, freq: number, peak: number, dur: number) {
  const c = audio(), t = c.currentTime;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = whiteNoise();
  f.type = filter;
  f.frequency.value = freq;
  envelope(g, t, peak, dur);
  src.connect(f).connect(g).connect(bus());
  src.start(t, Math.random());
  src.stop(t + dur + 0.02);
}

const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

/** A little pitch drift on every press keeps it from sounding like a machine. */
export function playKey(pack: SoundPack) {
  if (volume <= 0) return;
  const v = 0.92 + Math.random() * 0.16;
  switch (pack) {
    case 'typewriter':
      burst('highpass', 2200 * v, 0.22, 0.03);
      tone('square', 1700 * v, 900, 0.04, 0.02);
      break;
    case 'raindrop':
      tone('sine', 1300 * v, 520 * v, 0.22, 0.09);
      break;
    case 'wooden':
      tone('triangle', 430 * v, 380 * v, 0.3, 0.06);
      burst('bandpass', 900 * v, 0.1, 0.02);
      break;
    case 'piano':
      tone('triangle', PENTA[Math.floor(Math.random() * 7)], PENTA[0], 0.16, 0.3, 1200);
      break;
    default:
      burst('lowpass', 850 * v, 0.5, 0.045);
      tone('sine', 150 * v, 70, 0.35, 0.06);
  }
}

export function playMiss() {
  if (volume <= 0) return;
  tone('sine', 120, 85, 0.3, 0.12);
}

/** Clean lines climb a pentatonic scale, so a clean run plays a small melody. */
export function playChime(step: number) {
  if (volume <= 0) return;
  const f = PENTA[step % PENTA.length];
  tone('sine', f, f, 0.14, 0.7);
  tone('sine', f * 2, f * 2, 0.04, 0.5);
}

export function playTick(accent: boolean) {
  if (volume <= 0) return;
  tone('sine', accent ? 660 : 440, accent ? 660 : 440, 0.08, 0.05);
}
