import type { GameState, Action } from '../types';
import { BOT_LEADERBOARD } from '../rantData';
import { getReputation, formatCount } from '../rantEngine';

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

function rankClass(i: number) {
  if (i === 0) return 'gold';
  if (i === 1) return 'silver';
  if (i === 2) return 'bronze';
  return '';
}

export default function Leaderboard({ state }: Props) {
  const user = state.user;

  // Build combined list: bots + player
  const playerEntry = user
    ? { username: user.username, rantsPosted: user.rantsPosted, reactionsReceived: user.reactionsReceived, battlesWon: user.battlesWon }
    : null;

  const allEntries = [...BOT_LEADERBOARD];

  // Insert player at correct position by reactionsReceived
  let playerRank = allEntries.length + 1;
  if (playerEntry) {
    const idx = allEntries.findIndex(e => e.reactionsReceived < playerEntry.reactionsReceived);
    if (idx === -1) {
      allEntries.push(playerEntry);
      playerRank = allEntries.length;
    } else {
      allEntries.splice(idx, 0, playerEntry);
      playerRank = idx + 1;
    }
  }

  return (
    <div className="screen">
      <div className="leaderboard-screen">
        <div className="lb-header">Leaderboard 🏆</div>
        <div className="lb-sub">Top ranters by total reactions</div>

        <div className="lb-list">
          {allEntries.map((entry, i) => {
            const isPlayer = playerEntry && entry.username === playerEntry.username;
            const initials = entry.username.slice(0, 2).toUpperCase();
            return (
              <div key={entry.username} className={`lb-row ${isPlayer ? 'player-row' : ''}`}>
                <span className={`lb-rank ${rankClass(i)}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="lb-avatar">{initials}</div>
                <div>
                  <div className="lb-name">{entry.username}{isPlayer ? ' (you)' : ''}</div>
                  <div className="lb-stats">
                    {entry.rantsPosted} rants · {entry.battlesWon} battles won · {getReputation(entry.rantsPosted)}
                  </div>
                </div>
                <div className="lb-score">{formatCount(entry.reactionsReceived)}</div>
              </div>
            );
          })}
        </div>

        {playerEntry && (
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--muted)' }}>
            You are ranked #{playerRank} · keep ranting to climb 🔥
          </div>
        )}
      </div>
    </div>
  );
}
