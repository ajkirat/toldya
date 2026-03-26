let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(
  freq: number, endFreq: number,
  startGain: number, endGain: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
) {
  try {
    const c = ctx()
    const t = c.currentTime + delay
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t + duration)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(startGain, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(Math.max(endGain, 0.0001), t + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  } catch { /* ignore AudioContext errors */ }
}

// Whoosh — potato passed between players
export function playPass() {
  tone(900, 220, 0.28, 0.001, 0.18, 'sine')
  tone(450, 110, 0.16, 0.001, 0.15, 'triangle', 0.04)
}

// Clock tick — rate increases as time runs out
export function playTick() {
  tone(1200, 1000, 0.13, 0.001, 0.05, 'square')
}

// Big boom — potato explodes
export function playExplosion() {
  try {
    const c = ctx()
    const bufferSize = Math.floor(c.sampleRate * 0.8)
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5)
    }
    const source = c.createBufferSource()
    source.buffer = buffer
    const noiseGain = c.createGain()
    noiseGain.gain.setValueAtTime(1.8, c.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8)
    source.connect(noiseGain)
    noiseGain.connect(c.destination)
    source.start()
  } catch { /* ignore */ }
  tone(80, 40, 0.6, 0.001, 0.7, 'sine')
  tone(200, 60, 0.35, 0.001, 0.45, 'sawtooth', 0.05)
}

// Ascending fanfare — match winner
export function playWin() {
  const notes = [523, 659, 784, 1047] // C E G C
  notes.forEach((freq, i) => {
    tone(freq, freq, 0.3, 0.001, 0.28, 'triangle', i * 0.14)
  })
}

// Countdown beep
export function playCountdown(isGo: boolean) {
  if (isGo) {
    tone(880, 880, 0.3, 0.001, 0.2, 'sine')
    tone(1100, 1100, 0.25, 0.001, 0.3, 'sine', 0.1)
  } else {
    tone(440, 440, 0.22, 0.001, 0.12, 'sine')
  }
}
