import { useMemo } from 'react';
import type { Rant, ReactionKey, Action } from '../types';
import { formatCount, haptic } from '../rantEngine';
import { sfxExpand, sfxReaction } from '../sfx';

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: 'relatable', emoji: '🔥', label: 'felt' },
  { key: 'funny',     emoji: '😂', label: 'dead' },
  { key: 'accurate',  emoji: '🎯', label: 'fact' },
];

const CATEGORY_BG: Record<string, string> = {
  work:          '#FFFEF0',
  life:          '#F0FFF8',
  tech:          '#EFF6FF',
  politics:      '#FAF5FF',
  sports:        '#FFF7ED',
  relationships: '#FFF1F2',
  all:           '#FFFFFF',
};

const CATEGORY_EMOJI: Record<string, string> = {
  work:          '💼',
  life:          '🏠',
  tech:          '💻',
  politics:      '🗳️',
  sports:        '⚽',
  relationships: '💔',
  all:           '🔥',
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

function WaveformDeco() {
  const bars = useMemo(
    () => Array.from({ length: 24 }, () => 4 + Math.random() * 20),
    []
  );
  return (
    <div className="card-waveform-deco">
      {bars.map((h, i) => (
        <div key={i} className="card-wave-bar" style={{ height: h }} />
      ))}
    </div>
  );
}

interface Props {
  rant: Rant;
  userReactions: ReactionKey[];
  dispatch: (a: Action) => void;
  onExpand: () => void;
  compact?: boolean;
}

export default function RantCard({ rant, userReactions, dispatch, onExpand, compact }: Props) {
  function handleExpand() {
    if (compact) return;
    haptic('medium');
    sfxExpand();
    onExpand();
  }

  function handleReaction(e: React.MouseEvent, key: ReactionKey) {
    e.stopPropagation();
    haptic('light');
    sfxReaction(key);
    dispatch({ type: 'PLACE_REACTION', rantId: rant.id, reaction: key });
  }

  function handleJoinRant(e: React.MouseEvent) {
    e.stopPropagation();
    haptic('medium');
    dispatch({ type: 'NAVIGATE', view: 'record' });
  }

  const initials = rant.author.slice(0, 2).toUpperCase();
  const bg = CATEGORY_BG[rant.category] ?? '#FFFFFF';
  const catEmoji = CATEGORY_EMOJI[rant.category] ?? '🔥';

  return (
    <div className="rant-card" style={{ background: bg }} onClick={handleExpand}>
      {/* Header */}
      <div className="rant-card-header">
        <div className="rant-avatar">{initials}</div>
        <div className="rant-user-info">
          <div className="rant-author">{rant.author}</div>
          <div className="rant-meta">
            <span className="rant-cat-badge">{catEmoji} {rant.category}</span>
            <span className="rant-time">{timeAgo(rant.timestamp)}</span>
          </div>
        </div>
        <span className="rant-duration-badge">▶ {rant.duration}s</span>
      </div>

      {/* Quoted title */}
      <div className="rant-title">"{rant.title}"</div>

      {/* Decorative waveform */}
      <div className="waveform-deco-wrap">
        <WaveformDeco />
      </div>

      {/* Reactions */}
      <div className="rant-reactions">
        {REACTIONS.map(r => {
          const isActive = userReactions.includes(r.key);
          return (
            <div key={r.key} className="rxn-wrap">
              <span
                className={`rxn-launch-ghost${isActive ? ' rxn-launch-ghost--fly' : ''}`}
                aria-hidden="true"
              >{r.emoji}</span>
              <button
                className={`reaction-btn ${r.key} ${isActive ? 'active' : ''}`}
                onClick={e => handleReaction(e, r.key)}
              >
                <span className="emoji">{r.emoji}</span>
                <span className="rxn-label">{r.label}</span>
                <span>{formatCount(rant.reactions[r.key])}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Join CTA */}
      {!compact && (
        <button className="join-rant-btn" onClick={handleJoinRant}>
          🎤 Join this rant
        </button>
      )}
    </div>
  );
}
