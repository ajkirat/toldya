import { useState, useMemo, useRef, useEffect } from 'react';
import type { Rant, ReactionKey, Action } from '../types';
import { formatCount, getReputation, haptic } from '../rantEngine';
import { sfxExpand, sfxReaction, sfxPlayPause } from '../sfx';
import RantRelay from './RantRelay';

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'relatable', emoji: '🔥', label: 'Relatable' },
  { key: 'funny',     emoji: '😂', label: 'Funny' },
  { key: 'problem',   emoji: '🤦', label: 'Problem' },
  { key: 'accurate',  emoji: '🎯', label: 'Accurate' },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface WaveformProps { playing: boolean; duration: number; }
function WaveformBars({ playing, duration }: WaveformProps) {
  const bars = useMemo(
    () => Array.from({ length: 28 }, () => 8 + Math.random() * 28),
    []
  );
  return (
    <>
      <div className="waveform">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`waveform-bar ${playing ? 'playing' : ''}`}
            style={{ height: h, '--delay': `${i * 0.022}s` } as React.CSSProperties}
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
  compact?: boolean;
}

export default function RantCard({ rant, userReactions, dispatch, compact }: Props) {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  function togglePlay(e: React.MouseEvent) {
    e.stopPropagation();
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
      // Bot rant — animate waveform only
      setPlaying(p => !p);
      if (!playing) setTimeout(() => setPlaying(false), rant.duration * 1000);
    }
  }

  function handleExpand() {
    if (compact) return;
    haptic('medium');
    sfxExpand();
    setExpanded(true);
  }

  function handleReaction(e: React.MouseEvent, key: ReactionKey) {
    e.stopPropagation();
    haptic('light');
    sfxReaction(key);
    dispatch({ type: 'PLACE_REACTION', rantId: rant.id, reaction: key });
  }

  const initials = rant.author.slice(0, 2).toUpperCase();
  const rep = getReputation(rant.isBot ? 15 : 0);

  return (
    <>
      <div className="rant-card" onClick={handleExpand}>
        {/* Header */}
        <div className="rant-card-header">
          <div className="rant-avatar">{initials}</div>
          <div>
            <div className="rant-author">{rant.author}</div>
            <div className="rant-rep">{rep}</div>
          </div>
          <span className="rant-cat-badge">{rant.category}</span>
          <span className="rant-time">{timeAgo(rant.timestamp)}</span>
        </div>

        {/* Title */}
        <div className="rant-title">{rant.title}</div>

        {/* Waveform */}
        <div className="waveform-wrap">
          <button className={`play-btn ${playing ? 'playing' : ''}`} onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <WaveformBars playing={playing} duration={rant.duration} />
        </div>

        {/* Reactions */}
        <div className="rant-reactions">
          {REACTIONS.map(r => (
            <button
              key={r.key}
              className={`reaction-btn ${r.key} ${userReactions.includes(r.key) ? 'active' : ''}`}
              onClick={e => handleReaction(e, r.key)}
            >
              <span className="emoji">{r.emoji}</span>
              {formatCount(rant.reactions[r.key])}
            </button>
          ))}
        </div>
      </div>

      {expanded && (
        <RantRelay
          rant={rant}
          userReactions={userReactions}
          dispatch={dispatch}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}
