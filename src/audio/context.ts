let ctx: AudioContext | null = null;
let white: AudioBuffer | null = null;

/** Created lazily: browsers only allow audio after a user gesture. */
export function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function whiteNoise(seconds = 2): AudioBuffer {
  const c = audio();
  if (white && seconds <= 2) return white;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  if (seconds <= 2) white = buf;
  return buf;
}
