import type { User, Bet, Market } from '../types';
import { getPlayerTitle, getPredictionIQ, getTopPercent } from '../gameEngine';
import { BOT_LEADERBOARD } from '../gameData';

interface Props {
  user: User;
  bets: Bet[];
  markets: Market[];
}

const TITLE_COLORS: Record<string, string> = {
  'Legend':           '#f59e0b',
  'Oracle':           '#a855f7',
  'Sharp Analyst':    'var(--primary)',
  'Market Reader':    'var(--yes)',
  'Rookie Predictor': 'var(--muted)',
};

export default function Profile({ user, bets, markets }: Props) {
  const accuracy = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
    : 0;

  const title    = getPlayerTitle(user);
  const iq       = getPredictionIQ(user);
  const titleColor = TITLE_COLORS[title] ?? 'var(--muted)';

  // Compute rank among bots + player
  const allEntries = [
    ...BOT_LEADERBOARD,
    { username: user.username, coins: user.coins, totalProfit: user.totalProfit, accuracy, streak: user.streak },
  ].sort((a, b) => b.coins - a.coins);
  const playerRank  = allEntries.findIndex(e => e.username === user.username) + 1;
  const topPercent  = getTopPercent(playerRank, allEntries.length);

  const pendingBets  = bets.filter(b => !b.resolved);
  const resolvedBets = bets.filter(b => b.resolved).sort((a, b) => b.timestamp - a.timestamp);

  // Biggest Calls = top 3 winning bets by profit
  const biggestCalls = resolvedBets
    .filter(b => (b.profit ?? 0) > 0)
    .sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0))
    .slice(0, 3);

  const legendaryCalls = resolvedBets.filter(b => b.legendary);

  function getMarketTitle(marketId: string): string {
    return markets.find(m => m.id === marketId)?.title ?? 'Unknown Market';
  }

  const avatarLetter = user.username.charAt(0).toUpperCase();

  return (
    <div>
      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">{avatarLetter}</div>
        <div className="profile-username">{user.username}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
          <span className="player-title-badge" style={{ background: `${titleColor}20`, color: titleColor, borderColor: `${titleColor}50` }}>
            {title}
          </span>
          <span className="iq-badge">
            IQ {iq}
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--yes)', fontWeight: 600, marginTop: '6px' }}>
          {topPercent}
        </div>
        {legendaryCalls.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '4px' }}>
            🏆 {legendaryCalls.length} Legendary Call{legendaryCalls.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value stat-gold">{user.coins.toLocaleString()}</div>
          <div className="stat-card-label">Coins Balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: user.totalProfit >= 0 ? 'var(--yes)' : 'var(--no)' }}>
            {user.totalProfit >= 0 ? '+' : ''}{user.totalProfit.toLocaleString()}
          </div>
          <div className="stat-card-label">Total Profit</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value stat-blue">{accuracy}%</div>
          <div className="stat-card-label">Accuracy</div>
          <div className="accuracy-bar">
            <div className="accuracy-fill" style={{ width: `${accuracy}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value stat-orange">🔥 {user.streak}</div>
          <div className="stat-card-label">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value stat-purple">{user.bestStreak}</div>
          <div className="stat-card-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--text)' }}>
            {user.correctPredictions}/{user.totalPredictions}
          </div>
          <div className="stat-card-label">Correct / Total</div>
        </div>
      </div>

      {/* Biggest Calls */}
      {biggestCalls.length > 0 && (
        <div style={{ padding: '0 12px 8px' }}>
          <div className="section-header">🏆 Your Biggest Calls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {biggestCalls.map(bet => (
              <div key={bet.id} className="bet-history-item biggest-call-item">
                <span style={{ fontSize: '1rem' }}>{bet.legendary ? '🏆' : '✓'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                    {bet.marketTitle}
                  </div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--muted)' }}>
                    {bet.optionLabel ?? bet.side.toUpperCase()} · @{bet.probAtBet}% odds
                    {bet.legendary && <span style={{ color: '#f59e0b', marginLeft: '4px' }}>· Only {bet.probAtBet}% believed this!</span>}
                  </div>
                </div>
                <span className="bet-history-result win">+{bet.profit?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending bets */}
      {pendingBets.length > 0 && (
        <div style={{ padding: '0 12px 8px' }}>
          <div className="section-header">Open Bets ({pendingBets.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pendingBets.map(bet => (
              <div key={bet.id} className="bet-history-item">
                <span className={`bet-history-side ${bet.optionLabel ? '' : bet.side}`}
                  style={bet.optionLabel ? { background: 'var(--primary)', color: '#fff' } : {}}>
                  {bet.optionLabel ?? bet.side.toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bet.marketTitle}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>@{bet.probAtBet}% · {bet.confidence && bet.confidence !== 'normal' ? bet.confidence.toUpperCase() + ' confidence' : ''}</div>
                </div>
                <span className="bet-history-amount">{bet.amount.toLocaleString()}</span>
                <span className="bet-history-result pending">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bet history */}
      <div style={{ padding: '0 12px 16px' }}>
        <div className="section-header">Prediction Archive</div>
        {resolvedBets.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <span className="empty-icon">📜</span>
            <p>No resolved bets yet. Go place some!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resolvedBets.slice(0, 20).map(bet => (
              <div key={bet.id} className="bet-history-item">
                <span className={`bet-history-side ${bet.optionLabel ? '' : bet.side}`}
                  style={bet.optionLabel ? { background: 'var(--primary)', color: '#fff' } : {}}>
                  {bet.optionLabel ?? bet.side.toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bet.marketTitle}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                    Bet {bet.amount.toLocaleString()} @ {bet.probAtBet}%
                    {bet.legendary && <span style={{ color: '#f59e0b' }}> · 🏆 Legendary</span>}
                  </div>
                </div>
                <span className={`bet-history-result ${(bet.profit ?? 0) > 0 ? 'win' : 'loss'}`}>
                  {(bet.profit ?? 0) > 0 ? '+' : ''}{bet.profit?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
