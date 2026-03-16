import { useState, useMemo, useRef, useEffect } from 'react';
import type { Rant, ReactionKey, Action } from '../types';
import { formatCount, getReputation, haptic } from '../rantEngine';
import { sfxDismiss, sfxReaction, sfxPlayPause } from '../sfx';

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'relatable', emoji: '🔥', label: 'Relatable' },
  { key: 'funny',     emoji: '😂', label: 'Funny' },
  { key: 'problem',   emoji: '🤦', label: 'Problem' },
  { key: 'accurate',  emoji: '🎯', label: 'Accurate' },
];

interface WaveformProps { playing: boolean; duration: number; }
function WaveformBars({ playing, duration }: WaveformProps) {
  const bars = useMemo(
    () => Array.from({ length: 36 }, () => 8 + Math.random() * 32),
    []
  );
  return (
    <>
      <div className="waveform" style={{ height: 48 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className={`waveform-bar ${playing ? 'playing' : ''}`}
            style={{ height: h, '--delay': `${i * 0.018}s` } as React.CSSProperties}
          />
        ))}
      </div>
      <span className="rant-duration">{duration}s</span>
    </>
  );
}

interface Props {
  rant: Rant;
  userReactions: ReactionKey[];
  dispatch: (a: Action) => void;
  onClose: () => void;
}

export default function RantRelay({ rant, userReactions, dispatch, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  function close() {
    haptic('light');
    sfxDismiss();
    audioRef.current?.pause();
    onClose();
  }

  function togglePlay() {
    haptic('light');
    sfxPlayPause(!playing);
    if (rant.audioBase64) {
      if (!audioRef.current) {
        audioRef.current = new Audio(rant.audioBase64);
        audioRef.current.onended = () => setPlaying(false);
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
    } else {
      setPlaying(p => !p);
      if (!playing) setTimeout(() => setPlaying(false), rant.duration * 1000);
    }
  }

  function handleReaction(key: ReactionKey) {
    haptic('light');
    sfxReaction(key);
    dispatch({ type: 'PLACE_REACTION', rantId: rant.id, reaction: key });
  }

  const initials = rant.author.slice(0, 2).toUpperCase();
  const rep = getReputation(rant.isBot ? 15 : 0);

  return (
    <div className="relay-overlay" onClick={close}>
      <div className="relay-card" onClick={e => e.stopPropagation()}>
        <div className="relay-drag-handle" />

        {/* Close button — absolutely positioned, does NOT affect content centering */}
        <button className="relay-close-btn" onClick={close}>✕</button>

        {/* All content is centered relative to the FULL card width */}
        <div className="relay-exp-body">
          <div className="relay-author-row">
            <div className="relay-avatar">{initials}</div>
            <div>
              <div className="relay-author">{rant.author}</div>
              <div className="relay-rep">{rep}</div>
            </div>
          </div>

          <div className="relay-title">{rant.title}</div>

          <div className="relay-waveform-wrap">
            <button className={`play-btn ${playing ? 'playing' : ''}`} onClick={togglePlay}>
              {playing ? '⏸' : '▶'}
            </button>
            <WaveformBars playing={playing} duration={rant.duration} />
          </div>

          <div className="relay-reactions">
            {REACTIONS.map(r => (
              <button
                key={r.key}
                className={`relay-reaction-btn ${r.key} ${userReactions.includes(r.key) ? 'active' : ''}`}
                onClick={() => handleReaction(r.key)}
              >
                <span className="emoji">{r.emoji}</span>
                {formatCount(rant.reactions[r.key])}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
