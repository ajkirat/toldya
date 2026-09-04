// Pure Web Audio API sound effects — no external files, light-hearted & fun

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return _ctx;
}

// Always await resume before scheduling — Chrome suspends AudioContext until user engagement
async function tone(
  freq: number, endFreq: number,
  startGain: number, endGain: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
) {
  try {
    const c = getCtx();
    if (c.state !== 'running') await c.resume();
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(startGain, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), t + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch { /* ignore AudioContext errors */ }
}

// Cheerful rising pop — card tap to expand
export function sfxExpand() {
  tone(320, 640, 0.22, 0.001, 0.14, 'sine');
  tone(640, 960, 0.10, 0.001, 0.10, 'sine', 0.07);
}

// Soft descending whoosh — card close
export function sfxDismiss() {
  tone(600, 220, 0.18, 0.001, 0.16, 'sine');
}

// Quick swoosh — swipe
export function sfxSnooze() {
  tone(700, 140, 0.14, 0.001, 0.18, 'triangle');
}

// Distinct ding per reaction — each one sounds different & fun
export function sfxReaction(key: string) {
  switch (key) {
    case 'relatable': // 🔥 warm double-ding
      tone(880, 880, 0.22, 0.001, 0.12, 'sine');
      tone(1100, 1100, 0.14, 0.001, 0.10, 'sine', 0.10);
      break;
    case 'funny': // 😂 playful bouncy
      tone(660, 880, 0.20, 0.001, 0.08, 'sine');
      tone(880, 660, 0.16, 0.001, 0.08, 'sine', 0.10);
      tone(1100, 880, 0.12, 0.001, 0.08, 'sine', 0.20);
      break;
    case 'problem': // 🤦 descending thud
      tone(520, 260, 0.24, 0.001, 0.18, 'triangle');
      break;
    case 'accurate': // 🎯 sharp rising ping
      tone(740, 1480, 0.20, 0.001, 0.14, 'sine');
      break;
    default:
      tone(660, 880, 0.18, 0.001, 0.14, 'sine');
  }
}

// Friendly double-boop — FAB / record button press
export function sfxFab() {
  tone(500, 750, 0.22, 0.001, 0.10, 'sine');
  tone(750, 1000, 0.16, 0.001, 0.10, 'sine', 0.12);
}

// Gentle tick — nav tab switch
export function sfxNav() {
  tone(900, 900, 0.10, 0.001, 0.07, 'sine');
}

// Triumphant 3-note fanfare — rant posted 🎉
export function sfxPost() {
  tone(523, 523, 0.24, 0.001, 0.14, 'triangle');        // C5
  tone(659, 659, 0.22, 0.001, 0.14, 'triangle', 0.16);  // E5
  tone(784, 784, 0.28, 0.001, 0.22, 'triangle', 0.32);  // G5
}

// Subtle tone — play/pause toggle
export function sfxPlayPause(playing: boolean) {
  tone(playing ? 523 : 392, playing ? 523 : 392, 0.14, 0.001, 0.09, 'sine');
}

// Swipe tick — rant navigation
export function sfxSwipe() {
  tone(750, 750, 0.08, 0.001, 0.05, 'sine');
}

// Satisfying impact — battle vote
export function sfxVote() {
  tone(180, 360, 0.32, 0.001, 0.12, 'square');
  tone(360, 540, 0.18, 0.001, 0.10, 'triangle', 0.08);
}

// Rising ready tone — record start
export function sfxRecordStart() {
  tone(330, 660, 0.18, 0.001, 0.18, 'triangle');
}

// Satisfying completion — record stop
export function sfxRecordStop() {
  tone(660, 440, 0.20, 0.001, 0.14, 'triangle');
  tone(440, 330, 0.14, 0.001, 0.12, 'triangle', 0.12);
}

// Warm 4-note ascending arpeggio — welcome / onboarding confirm
export function sfxWelcome() {
  tone(392, 392, 0.18, 0.001, 0.10, 'sine');          // G4
  tone(494, 494, 0.16, 0.001, 0.10, 'sine', 0.12);    // B4
  tone(587, 587, 0.16, 0.001, 0.10, 'sine', 0.24);    // D5
  tone(784, 784, 0.20, 0.001, 0.18, 'sine', 0.36);    // G5
}

// Soft descending pop — discard / undo
export function sfxDiscard() {
  tone(480, 240, 0.16, 0.001, 0.16, 'sine');
  tone(300, 200, 0.08, 0.001, 0.10, 'triangle', 0.10);
}
