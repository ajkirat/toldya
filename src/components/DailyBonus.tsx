import type { Action } from '../gameEngine';
import { calculateDailyBonus } from '../gameEngine';

interface Props {
  bonusAmount: number;
  streak: number;
  dispatch: (a: Action) => void;
}

export default function DailyBonus({ bonusAmount, streak, dispatch }: Props) {
  const baseBonus = 50;
  const streakBonus = bonusAmount - baseBonus;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-icon">🎁</span>
          <div className="modal-title">Daily Bonus!</div>
          <div className="modal-subtitle">
            {streak > 0
              ? `You're on a ${streak}-day streak! Keep it going!`
              : 'Welcome back! Claim your daily reward.'}
          </div>
        </div>
        <div className="modal-body">
          <div className="bonus-amount">+{bonusAmount.toLocaleString()}</div>
          <div className="bonus-breakdown">
            <div className="row">
              <span>Base daily reward</span>
              <span>+{baseBonus} coins</span>
            </div>
            {streakBonus > 0 && (
              <div className="row">
                <span>🔥 Streak bonus ({streak} days)</span>
                <span>+{streakBonus} coins</span>
              </div>
            )}
            <div className="row" style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Total</span>
              <span style={{ fontWeight: 900, color: 'var(--gold)' }}>+{bonusAmount} coins</span>
            </div>
          </div>

          {streak < 14 && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--muted)',
              textAlign: 'center',
              padding: '4px',
            }}>
              Next streak milestone: {calculateDailyBonus(streak + 1)} coins at {streak + 1} days
            </div>
          )}

          <button
            className="btn btn-gold btn-full btn-lg"
            onClick={() => dispatch({ type: 'CLAIM_DAILY_BONUS' })}
          >
            Claim {bonusAmount.toLocaleString()} Coins
          </button>
          <button
            className="btn btn-ghost btn-full"
            onClick={() => dispatch({ type: 'DISMISS_DAILY_BONUS' })}
          >
            Claim Later
          </button>
        </div>
      </div>
    </div>
  );
}
