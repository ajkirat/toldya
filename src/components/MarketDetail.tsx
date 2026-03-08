import { useState } from 'react';
import type { Market, Bet, User, Confidence } from '../types';
import type { BetSide } from '../types';
import type { Action } from '../gameEngine';
import { getYesProb, getNoProb, getOptionProb, getTimeLeft, isUrgent, calculateExpectedPayout, calculateOptionPayout, CONFIDENCE_META, CONFIDENCE_MULT } from '../gameEngine';

const CATEGORY_BADGE: Record<string, string> = {
  sports: 'badge-sports', finance: 'badge-finance', weather: 'badge-weather',
  entertainment: 'badge-entertainment', platform: 'badge-platform',
};

const OPTION_COLORS = ['var(--yes)', '#f59e0b', 'var(--primary)', '#a855f7'];

interface Props {
  market: Market;
  bets: Bet[];
  user: User;
  dispatch: (a: Action) => void;
}

export default function MarketDetail({ market, bets, user, dispatch }: Props) {
  const [selectedSide, setSelectedSide] = useState<BetSide | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [betInput, setBetInput] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('normal');

  const isMCQ   = market.type === 'mcq' || market.type === 'range';
  const yesProb  = getYesProb(market);
  const noProb   = getNoProb(market);
  const timeLeft = getTimeLeft(market.closeTime);
  const urgent   = isUrgent(market.closeTime);
  const isOpen   = market.status === 'open' && market.closeTime > Date.now();

  const betAmount = parseInt(betInput, 10) || 0;
  const effectiveAmount = Math.max(1, Math.round(betAmount * CONFIDENCE_MULT[confidence]));

  const userBets   = bets.filter(b => b.marketId === market.id);
  const activeBet  = userBets.find(b => !b.resolved);
  const hasBet     = userBets.length > 0;

  // Binary payout (uses effectiveAmount)
  const expectedPayout = !isMCQ && selectedSide && betAmount > 0
    ? calculateExpectedPayout(effectiveAmount, selectedSide, market) : 0;
  const expectedProfit = expectedPayout - effectiveAmount;

  // MCQ payout (uses effectiveAmount)
  const mcqPayout = isMCQ && selectedOption !== null && betAmount > 0
    ? calculateOptionPayout(effectiveAmount, selectedOption, market) : 0;
  const mcqProfit = mcqPayout - effectiveAmount;

  // AI display
  const aiDiffFromMarket = Math.abs(market.aiPrediction * 100 - yesProb);
  const aiAgreesWith: 'yes' | 'no' | null =
    aiDiffFromMarket < 3 ? null :
    market.aiPrediction > yesProb / 100 ? 'yes' : 'no';
  const aiPredictedLabel = isMCQ
    ? (market.options?.[market.aiPredictedOption ?? 0] ?? 'Option 1')
    : null;

  function placeBinaryBet(side: BetSide) {
    if (betAmount <= 0 || effectiveAmount > user.coins) return;
    dispatch({ type: 'PLACE_BET', marketId: market.id, side, amount: betAmount, confidence });
    setBetInput(''); setSelectedSide(null); setConfidence('normal');
  }

  function placeMCQBet() {
    if (selectedOption === null || betAmount <= 0 || effectiveAmount > user.coins) return;
    dispatch({ type: 'PLACE_BET', marketId: market.id, side: 'yes', amount: betAmount, optionIdx: selectedOption, confidence });
    setBetInput(''); setSelectedOption(null); setConfidence('normal');
  }

  const quickAmounts = [50, 100, 250, 500].filter(a => a <= user.coins);
  const optionProbs  = market.options?.map((_, i) => getOptionProb(market, i)) ?? [];

  return (
    <div className="market-detail">
      <button className="back-btn" onClick={() => dispatch({ type: 'NAVIGATE', view: 'home' })}>
        ← Back to Markets
      </button>

      {/* Header */}
      <div className="market-detail-header">
        <div className="market-detail-meta" style={{ marginBottom: '8px' }}>
          <span className={`badge ${CATEGORY_BADGE[market.category]}`}>{market.category}</span>
          <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--muted)', fontSize: '0.65rem' }}>
            {market.type === 'mcq' ? 'PICK ONE' : market.type === 'range' ? 'RANGE' : 'YES/NO'}
          </span>
          {market.status === 'resolved' ? (
            <span className={`outcome-pill ${market.outcome}`}>
              Resolved: {market.type !== 'binary'
                ? (market.options?.[market.predeterminedOptionIdx ?? 0] ?? 'Option 1')
                : market.outcome?.toUpperCase()}
            </span>
          ) : (
            <span className={`timer ${urgent ? 'urgent' : 'normal'}`}>⏱ {timeLeft}</span>
          )}
        </div>
        <div className="market-detail-title">{market.title}</div>
        <div className="market-detail-desc">{market.description}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          Total pool:{' '}
          <strong style={{ color: 'var(--text)' }}>
            {isMCQ
              ? (market.optionPools ?? []).reduce((a, b) => a + b, 0).toLocaleString()
              : (market.yesPool + market.noPool).toLocaleString()}
          </strong>{' '}coins
        </div>
      </div>

      {/* ── BINARY probability display ─────────────────────── */}
      {!isMCQ && (
        <div className="market-detail-probs">
          <div className="big-prob-row">
            {(['yes', 'no'] as BetSide[]).map(side => {
              const prob = side === 'yes' ? yesProb : noProb;
              return (
                <div
                  key={side}
                  className={`big-prob-box ${side} ${selectedSide === side ? 'selected' : ''}`}
                  onClick={() => isOpen && setSelectedSide(side)}
                  style={{ cursor: isOpen ? 'pointer' : 'default' }}
                >
                  <div className="big-prob-label">{side.toUpperCase()}</div>
                  <div className="big-prob-value">{hasBet ? `${prob}%` : '?'}</div>
                  {isOpen && hasBet && (
                    <div className="big-prob-payout">
                      {betAmount > 0 && selectedSide === side
                        ? `Payout: ${Math.round(calculateExpectedPayout(betAmount, side, market)).toLocaleString()}`
                        : `Odds: ${(1 / (prob / 100)).toFixed(2)}×`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hasBet ? (
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--yes)', fontWeight: 700 }}>YES {yesProb}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--no)',  fontWeight: 700 }}>NO {noProb}%</span>
              </div>
              <div style={{ height: '10px', background: `linear-gradient(to right, var(--yes) ${yesProb}%, var(--no) ${yesProb}%)`, borderRadius: '5px', border: '1px solid var(--border)' }} />
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginBottom: '4px' }}>Bet to reveal crowd odds</div>
              <div style={{ height: '10px', background: 'var(--surface2)', borderRadius: '5px', border: '1px solid var(--border)' }} />
            </div>
          )}

          <div className="ai-comparison">
            <span className="ai-comparison-icon">🤖</span>
            <div className="ai-comparison-text">
              {hasBet ? (
                <>AI predicts <strong>YES at {Math.round(market.aiPrediction * 100)}%</strong>
                  {aiAgreesWith === null ? ' — aligns with market' : aiAgreesWith === 'yes' ? ' — more bullish than market' : ' — more bearish than market'}
                </>
              ) : <strong>AI has a prediction — bet to reveal</strong>}
            </div>
          </div>
        </div>
      )}

      {/* ── MCQ / RANGE option list ─────────────────────────── */}
      {isMCQ && market.options && (
        <div className="market-detail-probs">
          <div className="mcq-options">
            {market.options.map((label, i) => {
              const prob      = optionProbs[i];
              const userPick  = userBets.find(b => b.optionIdx === i);
              const isSelected = selectedOption === i;
              const color     = OPTION_COLORS[i % OPTION_COLORS.length];
              return (
                <div
                  key={i}
                  className={`mcq-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => isOpen && !activeBet && setSelectedOption(i)}
                  style={{ borderColor: isSelected ? color : undefined, cursor: isOpen && !activeBet ? 'pointer' : 'default' }}
                >
                  <div className="mcq-option-left">
                    <div className="mcq-option-label" style={{ color: isSelected ? color : undefined }}>
                      {userPick ? '✓ ' : ''}{label}
                    </div>
                    {hasBet && (
                      <div className="mcq-option-bar-track">
                        <div className="mcq-option-bar-fill" style={{ width: `${prob}%`, background: color }} />
                      </div>
                    )}
                  </div>
                  <div className="mcq-option-right">
                    <span className="mcq-option-prob" style={{ color }}>
                      {hasBet ? `${prob}%` : '?'}
                    </span>
                    {hasBet && (
                      <span className="mcq-option-odds" style={{ color: 'var(--muted)' }}>
                        {(100 / Math.max(prob, 1)).toFixed(1)}×
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ai-comparison" style={{ marginTop: '8px' }}>
            <span className="ai-comparison-icon">🤖</span>
            <div className="ai-comparison-text">
              {hasBet
                ? <>AI favours <strong>{aiPredictedLabel}</strong></>
                : <strong>AI has a pick — bet to reveal</strong>}
            </div>
          </div>
        </div>
      )}

      {/* ── Bet controls ────────────────────────────────────── */}
      {isOpen && (
        <div className="bet-section">
          <div className="bet-section-title">Place Your Bet</div>

          {activeBet && (
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '10px' }}>
              Active bet:{' '}
              <strong style={{ color: activeBet.optionLabel ? 'var(--primary)' : activeBet.side === 'yes' ? 'var(--yes)' : 'var(--no)' }}>
                {activeBet.optionLabel ?? activeBet.side.toUpperCase()} — {activeBet.amount.toLocaleString()} coins
              </strong>
            </div>
          )}

          {!activeBet && (
            <>
              <div className="quick-amounts">
                {quickAmounts.map(amt => (
                  <button key={amt} className="quick-btn" onClick={() => setBetInput(String(amt))}>{amt}</button>
                ))}
                <button className="quick-btn" onClick={() => setBetInput(String(user.coins))}>Max</button>
              </div>

              <div className="bet-input-row">
                <input
                  className="bet-input"
                  type="number"
                  min="1"
                  max={user.coins}
                  placeholder="Amount (coins)"
                  value={betInput}
                  onChange={e => setBetInput(e.target.value)}
                />
              </div>

              {/* Confidence selector */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  Confidence Level
                </div>
                <div className="confidence-selector">
                  {(['low', 'normal', 'high', 'all-in'] as Confidence[]).map(c => {
                    const meta = CONFIDENCE_META[c];
                    const isSelected = confidence === c;
                    return (
                      <button
                        key={c}
                        className={`confidence-btn ${isSelected ? 'selected' : ''}`}
                        style={isSelected ? { borderColor: meta.color, color: meta.color, background: `${meta.color}18` } : {}}
                        onClick={() => setConfidence(c)}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                {betAmount > 0 && confidence !== 'normal' && (
                  <div style={{ fontSize: '0.72rem', color: CONFIDENCE_META[confidence].color, marginTop: '4px', textAlign: 'center' }}>
                    Actual stake: <strong>{effectiveAmount.toLocaleString()} coins</strong>
                    {effectiveAmount > user.coins && <span style={{ color: 'var(--no)' }}> — insufficient balance</span>}
                  </div>
                )}
              </div>

              {/* Binary bet buttons */}
              {!isMCQ && (
                <>
                  {betAmount > 0 && selectedSide && (
                    <div className="bet-payout-preview">
                      <div>If <strong style={{ color: selectedSide === 'yes' ? 'var(--yes)' : 'var(--no)' }}>{selectedSide.toUpperCase()}</strong> wins:</div>
                      <div>
                        <span className="payout-value">+{Math.round(expectedProfit).toLocaleString()}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}> (→ {Math.round(expectedPayout).toLocaleString()})</span>
                      </div>
                    </div>
                  )}
                  {betAmount > 0 && selectedSide && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginBottom: '6px' }}>
                      {confidence !== 'low' && `Lose: `}
                      <span style={{ color: 'var(--no)' }}>
                        {confidence === 'low' ? `Risk only ${effectiveAmount.toLocaleString()} coins` : `−${effectiveAmount.toLocaleString()} coins`}
                      </span>
                    </div>
                  )}
                  <div className="bet-buttons">
                    {(['yes', 'no'] as BetSide[]).map(side => (
                      <button
                        key={side}
                        className={`btn btn-${side} ${selectedSide === side ? '' : 'btn-ghost'}`}
                        style={selectedSide === side ? {} : { borderColor: side === 'yes' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)', color: `var(--${side})` }}
                        onClick={() => { setSelectedSide(side); if (betAmount > 0 && effectiveAmount <= user.coins) placeBinaryBet(side); }}
                        disabled={betAmount <= 0 || effectiveAmount > user.coins}
                      >
                        {side.toUpperCase()} — Bet
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* MCQ bet confirm */}
              {isMCQ && selectedOption !== null && betAmount > 0 && (
                <>
                  <div className="bet-payout-preview">
                    <div>
                      If <strong style={{ color: OPTION_COLORS[selectedOption % OPTION_COLORS.length] }}>
                        {market.options?.[selectedOption]}
                      </strong> wins:
                    </div>
                    <div>
                      <span className="payout-value">+{Math.round(mcqProfit).toLocaleString()}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}> (→ {Math.round(mcqPayout).toLocaleString()})</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={placeMCQBet}
                    disabled={effectiveAmount > user.coins}
                    style={{ background: OPTION_COLORS[selectedOption % OPTION_COLORS.length], borderColor: OPTION_COLORS[selectedOption % OPTION_COLORS.length] }}
                  >
                    Bet {effectiveAmount.toLocaleString()} on {market.options?.[selectedOption]}
                  </button>
                </>
              )}

              {isMCQ && selectedOption === null && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>
                  ↑ Pick an option above, then enter your amount
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
            Balance: <strong style={{ color: 'var(--gold)' }}>{user.coins.toLocaleString()}</strong> coins · 2% platform fee
          </div>
        </div>
      )}

      {/* Your bets */}
      {userBets.length > 0 && (
        <div className="your-bets-section">
          <div className="bet-section-title">Your Bets on This Market</div>
          {userBets.map(bet => (
            <div key={bet.id} className="bet-history-item">
              <span className={`bet-history-side ${bet.optionLabel ? '' : bet.side}`}
                style={bet.optionLabel ? { background: 'var(--primary)', color: '#fff' } : {}}>
                {bet.optionLabel ?? bet.side.toUpperCase()}
              </span>
              <span className="bet-history-amount">{bet.amount.toLocaleString()} coins</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>@{bet.probAtBet}%</span>
              {bet.legendary && <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>🏆</span>}
              {bet.resolved ? (
                <span className={`bet-history-result ${(bet.profit ?? 0) > 0 ? 'win' : 'loss'}`}>
                  {(bet.profit ?? 0) > 0 ? `+${bet.profit?.toLocaleString()}` : bet.profit?.toLocaleString()}
                </span>
              ) : (
                <span className="bet-history-result pending">Pending</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
