// Простые синтезированные звуки через Web Audio API.
// Контекст один на всё приложение и создаётся лениво после первого тапа.

export type SoundType = 'chop' | 'sizzle' | 'ding' | 'error' | 'combo' | 'coin';

let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

const beep = (
  c: AudioContext,
  freq: number,
  startDelay: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
) => {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + startDelay;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
};

export const playSound = (sound: SoundType) => {
  const c = getCtx();
  if (!c) return;
  switch (sound) {
    case 'chop':
      beep(c, 220, 0, 0.08, 'square', 0.05);
      break;
    case 'sizzle':
      beep(c, 700, 0, 0.12, 'sawtooth', 0.03);
      break;
    case 'ding':
      beep(c, 880, 0, 0.15);
      beep(c, 1320, 0.08, 0.2);
      break;
    case 'coin':
      beep(c, 988, 0, 0.08);
      beep(c, 1319, 0.08, 0.15);
      break;
    case 'error':
      beep(c, 160, 0, 0.25, 'square', 0.06);
      break;
    case 'combo':
      beep(c, 523, 0, 0.1);
      beep(c, 659, 0.09, 0.1);
      beep(c, 784, 0.18, 0.2);
      break;
  }
};
