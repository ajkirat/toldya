// Pure Web Audio API sound effects — no external files

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(
  freq: number, endFreq: number,
  startGain: number, endGain: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
) {
  try {
    const c = ctx();
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t + duration);
    gain.gain.setValueAtTime(startGain, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), t + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  } catch { /* ignore AudioContext errors */ }
}

// Rising pop — card expand
export function sfxExpand() {
  tone(280, 560, 0.18, 0.001, 0.12, 'sine');
}

// Descending whoosh — card close / dismiss
export function sfxDismiss() {
  tone(520, 200, 0.15, 0.001, 0.14, 'sine');
}

// Quick whoosh — swipe snooze
export function sfxSnooze() {
  tone(600, 150, 0.12, 0.001, 0.18, 'triangle');
}

// Ding per reaction type
export function sfxReaction(key: string) {
  const freqs: Record<string, [number, number]> = {
    relatable: [880, 1100],   // fire — warm ding
    funny:     [660, 990],    // laugh — playful
    problem:   [440, 330],    // facepalm — descending
    accurate:  [740, 1480],   // target — rising
  };
  const [f, ef] = freqs[key] ?? [660, 880];
  tone(f, ef, 0.2, 0.001, 0.18, 'sine');
}

// Double boop — FAB press
export function sfxFab() {
  tone(440, 660, 0.2, 0.001, 0.1, 'sine');
  tone(660, 880, 0.15, 0.001, 0.1, 'sine', 0.12);
}

// Soft click — nav tab
export function sfxNav() {
  tone(800, 800, 0.08, 0.001, 0.06, 'sine');
}

// 3-note ascending fanfare — rant posted
export function sfxPost() {
  tone(440, 440, 0.2, 0.001, 0.12, 'triangle');
  tone(554, 554, 0.2, 0.001, 0.12, 'triangle', 0.14);
  tone(660, 660, 0.25, 0.001, 0.18, 'triangle', 0.28);
}

// Tone toggle — play/pause
export function sfxPlayPause(playing: boolean) {
  tone(playing ? 440 : 330, playing ? 440 : 330, 0.12, 0.001, 0.08, 'sine');
}

// Swipe tick — rant navigation
export function sfxSwipe() {
  tone(700, 700, 0.07, 0.001, 0.05, 'sine');
}

// Thwack — battle vote
export function sfxVote() {
  tone(200, 400, 0.3, 0.001, 0.15, 'square');
}

// Triangle wave on — record start
export function sfxRecordStart() {
  tone(220, 440, 0.15, 0.001, 0.2, 'triangle');
}

// Descending triangle — record stop
export function sfxRecordStop() {
  tone(440, 180, 0.18, 0.001, 0.2, 'triangle');
}
