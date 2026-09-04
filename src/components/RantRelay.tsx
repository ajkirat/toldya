import { useState, useMemo, useRef, useEffect } from 'react';
import type { Rant, ReactionKey, RantCategory, Action } from '../types';
import { formatCount, haptic } from '../rantEngine';
import { sfxDismiss, sfxReaction, sfxPlayPause, sfxSwipe } from '../sfx';

const REACTIONS: { key: ReactionKey; emoji: string; label: string; color: string; bg: string }[] = [
  { key: 'relatable', emoji: '🔥', label: 'Relatable', color: '#FF4D1C', bg: 'rgba(255,77,28,0.12)' },
  { key: 'funny',     emoji: '😂', label: 'Funny',     color: '#b39500', bg: 'rgba(255,235,59,0.18)' },
  { key: 'problem',   emoji: '🤦', label: 'Problem',   color: '#7c3aed', bg: 'rgba(167,139,250,0.15)' },
  { key: 'accurate',  emoji: '🎯', label: 'Accurate',  color: '#16a34a', bg: 'rgba(34,197,94,0.12)' },
];

const RELAY_CATEGORIES: { key: string; emoji: string; label: string }[] = [
  { key: 'all',           emoji: '🔥', label: 'All' },
  { key: 'work',          emoji: '💼', label: 'Work' },
  { key: 'life',          emoji: '🏠', label: 'Life' },
  { key: 'tech',          emoji: '💻', label: 'Tech' },
  { key: 'politics',      emoji: '🗳️', label: 'Politics' },
  { key: 'sports',        emoji: '⚽', label: 'Sports' },
  { key: 'relationships', emoji: '💔', label: 'Love' },
];

const CATEGORY_BG: Record<string, string> = {
  work:          '#FFFEF5',
  life:          '#F5FFF8',
  tech:          '#F0F5FF',
  politics:      '#FAF5FF',
  sports:        '#FFF8F0',
  relationships: '#FFF5F5',
  all:           '#FFFBF5',
};

const CATEGORY_EMOJI: Record<string, string> = {
  work: '💼', life: '🏠', tech: '💻',
  politics: '🗳️', sports: '⚽', relationships: '💔', all: '🔥',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface WaveformProps { playing: boolean; duration: number; elapsed: number; }
function WaveformPlayer({ playing, duration, elapsed }: WaveformProps) {
  const bars = useMemo(
    () => Array.from({ length: 32 }, () => 6 + Math.random() * 28),
    []
  );
  const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 0;
  const playedBars = Math.floor(progress * bars.length);

  return (
    <div className="relay-waveform-player">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`relay-wave-bar ${i < playedBars ? 'played' : ''} ${playing && i === playedBars ? 'current' : ''}`}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

interface Props {
  rants: Rant[];
  userReactions: Record<string, ReactionKey[]>;
  dispatch: (a: Action) => void;
  todayPrompt?: string;
  onClose?: () => void;
}

export default function RantRelay({ rants, userReactions, dispatch, todayPrompt, onClose }: Props) {
  const [idx, setIdx]             = useState(0);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [playing, setPlaying]     = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [inviteCopied, setInviteCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const safeRants = useMemo(() => {
    if (activeCat === 'all') return rants;
    const filtered = rants.filter(r => r.category === (activeCat as RantCategory));
    return filtered.length > 0 ? filtered : rants;
  }, [rants, activeCat]);

  const rant = safeRants[Math.min(idx, safeRants.length - 1)];

  // Reset index when category changes
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
    setElapsed(0);
    audioRef.current?.pause();
    audioRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeCat]);

  // Reset playback when rant changes
  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    audioRef.current?.pause();
    audioRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [rant?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!rant) return null;

  function close() {
    haptic('light');
    sfxDismiss();
    audioRef.current?.pause();
    if (onClose) onClose();
  }

  function togglePlay() {
    haptic('light');
    sfxPlayPause(!playing);

    const audioSrc = rant.audioBase64 ?? rant.audioUrl;

    if (audioSrc) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.onended = () => {
          setPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
          // auto-advance to next rant
          setIdx(i => Math.min(i + 1, safeRants.length - 1));
        };
        audioRef.current.ontimeupdate = () => {
          setElapsed(audioRef.current?.currentTime ?? 0);
        };
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        audioRef.current.play().catch(() => {});
        setPlaying(true);
      }
    } else {
      // Simulated playback for rants without audio
      if (playing) {
        setPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setPlaying(true);
        setElapsed(0);
        timerRef.current = setInterval(() => {
          setElapsed(e => {
            if (e >= rant.duration) {
              setPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              // auto-advance to next rant
              setIdx(i => Math.min(i + 1, safeRants.length - 1));
              return 0;
            }
            return e + 0.1;
          });
        }, 100);
      }
    }
  }

  function handleShare() {
    haptic('light');
    const text = `"${rant.title}" — listen & react on rantr`;
    const url  = 'https://rantr.vercel.app';
    if (navigator.share) {
      navigator.share({ title: 'rantr', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  }

  function handleInvite() {
    haptic('medium');
    const url  = 'https://rantr.vercel.app';
    const text = `come rant with me on rantr 😤 — tiny rage. big community. ${url}`;
    if (navigator.share) {
      navigator.share({ title: 'rantr 😤', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      }).catch(() => {});
    }
  }

  function handleReaction(key: ReactionKey) {
    haptic('light');
    sfxReaction(key);
    dispatch({ type: 'PLACE_REACTION', rantId: rant.id, reaction: key });
  }

  function navigateNext() {
    if (idx < safeRants.length - 1) {
      haptic('light');
      sfxSwipe();
      setIdx(i => i + 1);
    }
  }

  function navigatePrev() {
    if (idx > 0) {
      haptic('light');
      sfxSwipe();
      setIdx(i => i - 1);
    }
  }

  const myReactions = userReactions[rant.id] ?? [];
  const initials    = rant.author.slice(0, 2).toUpperCase();
  const catEmoji    = CATEGORY_EMOJI[rant.category] ?? '🔥';
  const remainTime  = Math.max(0, Math.ceil(rant.duration - elapsed));
  const bg          = CATEGORY_BG[rant.category] ?? '#FFFBF5';

  return (
    <div className="relay-home-screen" style={{ background: bg }}>

      {/* ── Top bar ── */}
      <div className="relay-top-bar">
        <div className="relay-top-left">
          <div className="relay-author-chip">
            <div className="relay-chip-avatar">{initials}</div>
            <span className="relay-chip-author">{rant.author}</span>
            <span className="relay-chip-dot">·</span>
            <span className="relay-chip-time">{timeAgo(rant.timestamp)}</span>
            <span className="relay-chip-dot">·</span>
            <span className="relay-chip-cat">{catEmoji} {rant.category}</span>
          </div>
        </div>
        <div className="relay-top-actions">
          <button className="relay-top-btn" onClick={handleShare} aria-label="Share">📤</button>
          <button
            className="relay-top-btn"
            onClick={() => { haptic('light'); dispatch({ type: 'NAVIGATE', view: 'battles' }); }}
            aria-label="Battles"
          >⚔️</button>
          <button
            className="relay-top-btn"
            onClick={() => { haptic('medium'); dispatch({ type: 'NAVIGATE', view: 'record' }); }}
            aria-label="Record"
          >🎤</button>
          {onClose && (
            <button className="relay-top-btn close-btn" onClick={close} aria-label="Close">✕</button>
          )}
        </div>
      </div>

      {/* ── Prev nav ── */}
      {idx > 0 && (
        <button className="relay-nav-prev" onClick={navigatePrev}>▲ prev</button>
      )}

      {/* ── Main content ── */}
      <div className="relay-content">
        <div className="relay-big-title">"{rant.title}"</div>
        <div className="relay-vibe-actions">
          <button
            className="relay-vibe-nudge"
            onClick={() => {
              haptic('medium');
              dispatch({ type: 'NAVIGATE_RECORD', prefill: todayPrompt ?? '' });
            }}
          >
            🎤 add your take
          </button>
          <button
            className={`relay-invite-btn${inviteCopied ? ' copied' : ''}`}
            onClick={handleInvite}
          >
            {inviteCopied ? '✅ link copied!' : '👋 invite a friend'}
          </button>
        </div>
      </div>

      {/* ── Player ── */}
      <div className="relay-player-area">
        <button
          className={`relay-play-btn ${playing ? 'playing' : ''}`}
          onClick={togglePlay}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="relay-waveform-wrap">
          <WaveformPlayer playing={playing} duration={rant.duration} elapsed={elapsed} />
          <div className="relay-play-status">
            {playing ? `▶ playing · ${remainTime}s` : `▶ ${rant.duration}s`}
          </div>
        </div>
      </div>

      {/* ── Reactions ── */}
      <div className="relay-big-reactions">
        {REACTIONS.map(r => (
          <button
            key={r.key}
            className={`relay-big-rxn ${r.key} ${myReactions.includes(r.key) ? 'active' : ''}`}
            style={myReactions.includes(r.key) ? { background: r.bg, borderColor: r.color, color: r.color } : {}}
            onClick={() => handleReaction(r.key)}
          >
            <span className="rxn-emoji">{r.emoji}</span>
            <span className="rxn-count">{formatCount(rant.reactions[r.key])}</span>
            <span className="rxn-label">{r.label}</span>
          </button>
        ))}
      </div>

      {/* ── Category strip ── */}
      <div className="relay-cat-strip">
        {RELAY_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`relay-cat-pill${activeCat === cat.key ? ' active' : ''}`}
            onClick={() => { haptic('light'); setActiveCat(cat.key); }}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ── Next nav ── */}
      {idx < safeRants.length - 1 && (
        <button className="relay-nav-next" onClick={navigateNext}>
          next ▼
        </button>
      )}
    </div>
  );
}
