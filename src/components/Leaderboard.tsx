import { useState } from 'react';
import type { User } from '../types';
import { BOT_LEADERBOARD, type BotEntry } from '../gameData';
import { getPlayerTitle } from '../gameEngine';

interface LeaderboardEntry extends BotEntry {
  isPlayer: boolean;
}

type Tab = 'coins' | 'accuracy' | 'streak';

interface Props {
  user: User;
}

function getRankDisplay(rank: number): { label: string; className: string } {
  if (rank === 1) return { label: '🥇', className: 'gold' };
  if (rank === 2) return { label: '🥈', className: 'silver' };
  if (rank === 3) return { label: '🥉', className: 'bronze' };
  return { label: `#${rank}`, className: '' };
}

const TITLE_COLORS: Record<string, string> = {
  'Legend':           '#f59e0b',
  'Oracle':           '#a855f7',
  'Sharp Analyst':    'var(--primary)',
  'Market Reader':    'var(--yes)',
  'Rookie Predictor': 'var(--muted)',
};

export default function Leaderboard({ user }: Props) {
  const [tab, setTab] = useState<Tab>('coins');

  const playerAccuracy = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
    : 0;

  const playerEntry: LeaderboardEntry = {
    username: user.username,
    coins: user.coins,
    totalProfit: user.totalProfit,
    accuracy: playerAccuracy,
    streak: user.streak,
    isPlayer: true,
  };

  const all: LeaderboardEntry[] = [
    ...BOT_LEADERBOARD.map(b => ({ ...b, isPlayer: false })),
    playerEntry,
  ];

  const sorted = [...all].sort((a, b) => {
    if (tab === 'coins')    return b.coins    - a.coins;
    if (tab === 'accuracy') return b.accuracy - a.accuracy;
    if (tab === 'streak')   return b.streak   - a.streak;
    return 0;
  });

  const playerRankCoins = [...all].sort((a, b) => b.coins - a.coins).findIndex(e => e.isPlayer) + 1;
  const playerRankCurrent = sorted.findIndex(e => e.isPlayer) + 1;
  const playerTitle = getPlayerTitle(user);
  const titleColor = TITLE_COLORS[playerTitle] ?? 'var(--muted)';

  const tabMeta: Record<Tab, { label: string; valueKey: keyof BotEntry; format: (v: number) => string }> = {
    coins:    { label: 'Richest',   valueKey: 'coins',    format: v => v.toLocaleString() },
    accuracy: { label: 'Sharpest',  valueKey: 'accuracy', format: v => `${v}%` },
    streak:   { label: 'Hottest 🔥', valueKey: 'streak',  format: v => v > 0 ? `${v}` : '-' },
  };

  return (
    <div>
      {/* Player rank callout */}
      <div style={{
        margin: '12px',
        padding: '12px',
        background: 'var(--primary-dim)',
        border: '1px solid rgba(59,130,246,0.35)',
        borderRadius: 'var(--r)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{ fontSize: '1.5rem' }}>{getRankDisplay(playerRankCoins).label}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
            #{playerRankCoins} overall
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {user.coins.toLocaleString()} coins · {
              playerRankCoins > 1
                ? `${(all.sort((a, b) => b.coins - a.coins)[playerRankCoins - 2].coins - user.coins).toLocaleString()} behind #${playerRankCoins - 1}`
                : 'You\'re at the top!'
            }
          </div>
        </div>
        <span className="player-title-badge" style={{ background: `${titleColor}20`, color: titleColor, borderColor: `${titleColor}50` }}>
          {playerTitle}
        </span>
      </div>

      {/* Tabs */}
      <div className="lb-tabs">
        {(['coins', 'accuracy', 'streak'] as Tab[]).map(t => (
          <button
            key={t}
            className={`lb-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {tabMeta[t].label}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex',
        padding: '4px 12px 2px',
        fontSize: '0.65rem',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        fontWeight: 700,
        gap: '10px',
      }}>
        <span style={{ width: '28px' }}>#</span>
        <span style={{ flex: 1 }}>Trader</span>
        <span style={{ minWidth: '80px', textAlign: 'right' }}>
          {tab === 'coins' ? 'Coins' : tab === 'accuracy' ? 'Accuracy' : 'Streak'}
        </span>
        {tab === 'coins' && <span style={{ minWidth: '36px', textAlign: 'right' }}>Acc.</span>}
      </div>

      {/* Entries */}
      <div className="leaderboard-list">
        {sorted.map((entry, i) => {
          const rank = i + 1;
          const { label, className } = getRankDisplay(rank);
          const meta = tabMeta[tab];
          return (
            <div
              key={entry.username}
              className={`leaderboard-item ${entry.isPlayer ? 'is-player' : ''}`}
            >
              <span className={`leaderboard-rank ${className}`}>{label}</span>
              <span className={`leaderboard-name ${entry.isPlayer ? 'is-player' : ''}`} style={{ flex: 1 }}>
                {entry.username}
                {entry.isPlayer && (
                  <span style={{ fontSize: '0.65rem', marginLeft: '5px', color: 'var(--primary)', fontWeight: 400 }}>
                    (You)
                  </span>
                )}
              </span>
              <span className="leaderboard-coins" style={{ minWidth: '80px', textAlign: 'right' }}>
                {meta.format(entry[meta.valueKey] as number)}
              </span>
              {tab === 'coins' && (
                <span className="leaderboard-accuracy">{entry.accuracy}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
