import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameState, Action, VoiceEffect, RantCategory } from '../types';
import { generateAITitle, haptic } from '../rantEngine';
import { sfxRecordStart, sfxRecordStop, sfxPost } from '../sfx';

const AI_VOICES: { key: VoiceEffect; label: string; icon: string; desc: string }[] = [
  { key: 'none', label: 'My Voice', icon: '🎤', desc: 'Raw' },
  { key: 'm1',   label: 'Voice A',  icon: '🎭', desc: 'Deep' },
  { key: 'm2',   label: 'Voice B',  icon: '🎭', desc: 'Low' },
  { key: 'm3',   label: 'Voice C',  icon: '🎭', desc: 'Mid' },
  { key: 'f1',   label: 'Voice D',  icon: '🎭', desc: 'High' },
  { key: 'f2',   label: 'Voice E',  icon: '🎭', desc: 'Bright' },
  { key: 'f3',   label: 'Voice F',  icon: '🎭', desc: 'Clear' },
];

const DEMO_SETTINGS: Record<string, { pitch: number; rate: number }> = {
  m1: { pitch: 0.75, rate: 0.90 },
  m2: { pitch: 0.85, rate: 0.95 },
  m3: { pitch: 1.00, rate: 1.00 },
  f1: { pitch: 1.35, rate: 1.05 },
  f2: { pitch: 1.55, rate: 1.10 },
  f3: { pitch: 1.20, rate: 0.95 },
};

const MIN_SECS = 5;
const MAX_SECS = 15;

// ── WAV encoder ──────────────────────────────────────────────────────────────
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const dataLen = buffer.length * numCh * 2;
  const ab = new ArrayBuffer(44 + dataLen);
  const v = new DataView(ab);
  function ws(o: number, s: string) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  ws(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true); ws(8, 'WAVE');
  ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * numCh * 2, true); v.setUint16(32, numCh * 2, true);
  v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, dataLen, true);
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
    }
  }
  return ab;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

async function applyVoiceEffect(base64: string, effect: VoiceEffect): Promise<string> {
  if (effect === 'none') return base64;

  const SEMITONES: Record<string, number> = {
    m1: -2, m2: -1.5, m3: -1,
    f1: 1.5, f2: 2,   f3: 1,
  };
  const st = SEMITONES[effect] ?? 0;
  const rate = Math.pow(2, st / 12);

  try {
    // Decode base64 → ArrayBuffer
    const dataUrl = base64;
    const res = await fetch(dataUrl);
    const arrayBuffer = await res.arrayBuffer();

    const decodeCtx = new AudioContext();
    const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
    await decodeCtx.close();

    const offlineCtx = new OfflineAudioContext(
      decoded.numberOfChannels,
      Math.ceil(decoded.length / rate),
      decoded.sampleRate,
    );
    const src = offlineCtx.createBufferSource();
    src.buffer = decoded;
    src.playbackRate.value = rate;

    // Light EQ per voice
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.value = effect.startsWith('m') ? 200 : 3000;
    filter.gain.value = effect.startsWith('m') ? 4 : 3;
    filter.Q.value = 1;
    src.connect(filter);
    filter.connect(offlineCtx.destination);
    src.start(0);

    const rendered = await offlineCtx.startRendering();
    const wav = audioBufferToWav(rendered);
    const wavBlob = new Blob([wav], { type: 'audio/wav' });
    return await blobToBase64(wavBlob);
  } catch {
    return base64; // fallback to unprocessed
  }
}

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function RecordScreen({ state, dispatch }: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [voiceEffect, setVoiceEffect] = useState<VoiceEffect>('none');
  const [processing, setProcessing] = useState(false);
  const [liveBars, setLiveBars] = useState<number[]>(Array(28).fill(4));
  const [category] = useState<RantCategory>('work');

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef     = useRef<number>(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef    = useRef<number>(0);

  const aiTitle = useRef(generateAITitle(category));

  useEffect(() => () => {
    stopAll();
    cancelAnimationFrame(animRef.current);
  }, []);

  function stopAll() {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    cancelAnimationFrame(animRef.current);
  }

  const animateBars = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const step = Math.floor(data.length / 28);
    const bars = Array.from({ length: 28 }, (_, i) => {
      const v = data[i * step] ?? 0;
      return 4 + (v / 255) * 44;
    });
    setLiveBars(bars);
    animRef.current = requestAnimationFrame(animateBars);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for live waveform
      const ac = new AudioContext();
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const b64 = await blobToBase64(blob);
        setAudioBase64(b64);
        setRecording(false);
        cancelAnimationFrame(animRef.current);
        setLiveBars(Array(28).fill(4));
        ac.close();
      };

      recorder.start(100);
      recorderRef.current = recorder;
      startRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      sfxRecordStart();
      haptic('medium');

      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(s);
        if (s >= MAX_SECS) stopRecording();
      }, 250);

      animateBars();
    } catch {
      dispatch({ type: 'NAVIGATE', view: 'feed' });
    }
  }

  function stopRecording() {
    const dur = Math.floor((Date.now() - startRef.current) / 1000);
    if (dur < MIN_SECS) return; // enforce minimum
    sfxRecordStop();
    haptic('heavy');
    stopAll();
    setElapsed(dur);
  }

  function discard() {
    setAudioBase64(null);
    setElapsed(0);
    setVoiceEffect('none');
    aiTitle.current = generateAITitle(category);
  }

  async function post() {
    if (!audioBase64) return;
    setProcessing(true);
    try {
      const processed = await applyVoiceEffect(audioBase64, voiceEffect);
      sfxPost();
      dispatch({
        type: 'POST_RANT',
        rant: {
          author: state.user?.username ?? 'Anonymous',
          title: aiTitle.current,
          audioBase64: processed,
          duration: elapsed,
          category,
          voiceEffect,
        },
      });
    } finally {
      setProcessing(false);
      setAudioBase64(null);
      setElapsed(0);
    }
  }

  function playDemo(key: VoiceEffect) {
    if (key === 'none' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance("Here is what your disguised voice will sound like.");
    const s = DEMO_SETTINGS[key];
    if (s) { utt.pitch = s.pitch; utt.rate = s.rate; }
    window.speechSynthesis.speak(utt);
  }

  const progress = (elapsed / MAX_SECS) * 100;
  const r = 64; const circ = 2 * Math.PI * r;

  return (
    <div className="screen">
      <div className="record-screen">
        <div className="record-title">Say it loud 😤</div>
        <div className="record-subtitle">
          {audioBase64
            ? 'Pick your voice, then post'
            : recording
              ? `Recording… ${MAX_SECS - elapsed}s left`
              : `Hold to record · ${MIN_SECS}–${MAX_SECS} seconds`}
        </div>

        {!audioBase64 && (
          <>
            {/* Circular timer + mic button */}
            <div className="mic-area">
              <svg className="mic-ring-svg" viewBox="0 0 148 148">
                <circle cx="74" cy="74" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
                {recording && (
                  <circle
                    cx="74" cy="74" r={r} fill="none"
                    stroke="var(--hot)" strokeWidth="3"
                    strokeDasharray={circ}
                    strokeDashoffset={circ - (circ * progress / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 74 74)"
                    style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                  />
                )}
              </svg>
              <button
                className={`mic-btn ${recording ? 'recording' : ''}`}
                onPointerDown={() => { if (!recording) startRecording(); }}
                onPointerUp={() => { if (recording) stopRecording(); }}
              >
                {recording ? '⏹' : '🎙️'}
              </button>
            </div>

            <div className="mic-timer">{recording ? `${elapsed}s` : ''}</div>

            <div className="mic-hint">
              {recording ? 'Lift to stop' : 'Hold the button and start ranting'}
            </div>

            {/* Live waveform */}
            <div className="live-waveform">
              {liveBars.map((h, i) => (
                <div key={i} className="live-bar" style={{ height: h }} />
              ))}
            </div>
          </>
        )}

        {/* Post-recording UI */}
        {audioBase64 && (
          <div className="after-record">
            {/* Voice selection */}
            <div className="voice-section-label">Voice · tap to preview</div>
            <div className="voice-grid">
              {AI_VOICES.map(v => (
                <button
                  key={v.key}
                  className={`voice-btn ${v.key === 'none' ? 'voice-btn-none' : ''} ${voiceEffect === v.key ? 'selected' : ''}`}
                  onClick={() => {
                    haptic('light');
                    setVoiceEffect(v.key);
                    playDemo(v.key);
                  }}
                >
                  <span>{v.icon} {v.label}</span>
                  <span className="v-label">{v.desc}</span>
                </button>
              ))}
            </div>

            {/* AI title */}
            <div className="title-preview-wrap">
              <div className="title-preview-label">AI-generated title</div>
              <div className="title-preview">{aiTitle.current}</div>
            </div>

            {/* Post / discard */}
            <div className="post-actions">
              <button className="btn-discard" onClick={discard}>Discard</button>
              <button
                className="btn-post"
                onClick={post}
                disabled={processing}
              >
                {processing ? 'Processing…' : 'Post Rant 🔥'}
              </button>
            </div>

            {processing && (
              <div className="processing-hint">
                {voiceEffect === 'none' ? '⚙️ Processing…' : '🎭 Applying voice disguise…'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
