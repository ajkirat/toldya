import { useState } from 'react';
import type { Market, Bet, MarketCategory } from '../types';
import type { Action } from '../gameEngine';
import { getYesProb, getNoProb, getOptionProb, getTimeLeft, isUrgent } from '../gameEngine';

const OPTION_COLORS = ['var(--yes)', '#f59e0b', 'var(--primary)', '#a855f7'];

const CATEGORY_LABELS: Record<MarketCategory | 'all', string> = {
  all:           'All',
  sports:        '⚽ Sports',
  finance:       '📈 Finance',
  weather:       '🌦️ Weather',
  entertainment: '🎬 Film',
  platform:      '🎮 Platform',
};

const CATEGORY_BADGE: Record<MarketCategory, string> = {
  sports:        'badge-sports',
  finance:       'badge-finance',
  weather:       'badge-weather',
  entertainment: 'badge-entertainment',
  platform:      'badge-platform',
};

interface Props {
  markets: Market[];
  bets: Bet[];
  dispatch: (a: Action) => void;
}

export default function MarketList({ markets, bets, dispatch }: Props) {
  const [filter, setFilter] = useState<MarketCategory | 'all'>('all');

  const filtered = markets
    .filter(m => filter === 'all' || m.category === filter)
    .sort((a, b) => {
      // Open markets first, then by close time
      if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
      return a.closeTime - b.closeTime;
    });

  function getUserBet(marketId: string): Bet | undefined {
    return bets.find(b => b.marketId === marketId && !b.resolved);
  }

  function hasEverBet(marketId: string): boolean {
    return bets.some(b => b.marketId === marketId);
  }

  const openCount = markets.filter(m => m.status === 'open').length;

  return (
    <div>
      {/* Stats bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.75rem',
      }}>
        <span style={{ color: 'var(--yes)', fontWeight: 700 }}>
          {openCount} active markets
        </span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>
          {bets.filter(b => !b.resolved).length} open bets
        </span>
        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
          {bets.filter(b => b.resolved && (b.profit ?? 0) > 0).length} wins
        </span>
      </div>

      {/* Category filter */}
      <div className="filter-tabs">
        {(Object.keys(CATEGORY_LABELS) as (MarketCategory | 'all')[]).map(cat => (
          <button
            key={cat}
            className={`filter-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Market cards */}
      <div className="market-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No markets in this category yet.</p>
          </div>
        ) : (
          filtered.map(market => {
            const isMCQ    = market.type === 'mcq' || market.type === 'range';
            const yesProb  = isMCQ ? 0 : getYesProb(market);
            const noProb   = isMCQ ? 0 : getNoProb(market);
            const userBet  = getUserBet(market.id);
            const revealed = hasEverBet(market.id) || market.status === 'resolved';
            const urgent   = market.status === 'open' && isUrgent(market.closeTime);
            const timeLeft = getTimeLeft(market.closeTime);
            const totalPool = isMCQ
              ? (market.optionPools ?? []).reduce((a, b) => a + b, 0)
              : market.yesPool + market.noPool;
            const winningOptionLabel = isMCQ && market.status === 'resolved'
              ? (market.options?.[market.predeterminedOptionIdx ?? 0] ?? 'Option 1')
              : null;

            return (
              <div
                key={market.id}
                className={`market-card ${urgent ? 'urgent' : ''} ${market.status === 'resolved' ? 'resolved' : ''}`}
                onClick={() => market.status === 'open'
                  ? dispatch({ type: 'NAVIGATE', view: 'market', marketId: market.id })
                  : undefined
                }
              >
                {/* Top row: badges + timer */}
                <div className="market-card-top">
                  <div className="market-card-badges">
                    <span className={`badge ${CATEGORY_BADGE[market.category]}`}>
                      {market.category}
                    </span>
                    {isMCQ && (
                      <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.62rem', letterSpacing: '0.04em' }}>
                        {market.type === 'range' ? 'RANGE' : 'PICK ONE'}
                      </span>
                    )}
                    {market.status === 'resolved' ? (
                      <span className={`outcome-pill ${market.outcome}`}>
                        {isMCQ
                          ? `✓ ${winningOptionLabel}`
                          : market.outcome === 'yes' ? '✓ YES' : '✗ NO'}
                      </span>
                    ) : urgent ? (
                      <span className="badge badge-urgent">⏰ Urgent</span>
                    ) : null}
                  </div>
                  <div className={`timer ${market.status === 'resolved' ? 'closed' : urgent ? 'urgent' : 'normal'}`}>
                    <span>{market.status === 'resolved' ? 'Ended' : `⏱ ${timeLeft}`}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="market-title">{market.title}</div>

                {/* Probability display */}
                {!isMCQ ? (
                  <div>
                    <div className="prob-row">
                      <span className="prob-label yes">YES</span>
                      <div className="prob-bar-track">
                        <div className="prob-bar-fill yes" style={{ width: revealed ? `${yesProb}%` : '0%' }} />
                      </div>
                      <span className="prob-pct yes">{revealed ? `${yesProb}%` : '?'}</span>
                    </div>
                    <div className="prob-row">
                      <span className="prob-label no">NO</span>
                      <div className="prob-bar-track">
                        <div className="prob-bar-fill no" style={{ width: revealed ? `${noProb}%` : '0%' }} />
                      </div>
                      <span className="prob-pct no">{revealed ? `${noProb}%` : '?'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mcq-card-options">
                    {(market.options ?? []).map((opt, i) => {
                      const prob = getOptionProb(market, i);
                      const color = OPTION_COLORS[i % OPTION_COLORS.length];
                      return (
                        <div key={i} className="mcq-card-option">
                          <div className="mcq-card-option-bar-track">
                            <div className="mcq-card-option-bar-fill"
                              style={{ width: revealed ? `${prob}%` : '0%', background: color }} />
                          </div>
                          <div className="mcq-card-option-row">
                            <span className="mcq-card-option-label" style={{ color }}>{opt}</span>
                            <span className="mcq-card-option-pct" style={{ color: revealed ? color : 'var(--muted)' }}>
                              {revealed ? `${prob}%` : '?'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="market-footer">
                  <div className="market-pool">
                    Pool: <strong>{totalPool.toLocaleString()}</strong> coins
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {/* AI prediction */}
                    <span className="badge badge-ai" title="AI prediction">
                      {revealed ? `AI ${Math.round(market.aiPrediction * 100)}%` : '🤖 AI ?'}
                    </span>
                    {/* User's active bet */}
                    {userBet && (
                      <span className={`your-bet-chip ${userBet.optionLabel ? '' : userBet.side}`}
                        style={userBet.optionLabel ? { background: 'var(--primary)', color: '#fff' } : {}}>
                        You: {userBet.optionLabel ?? userBet.side.toUpperCase()} {userBet.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
