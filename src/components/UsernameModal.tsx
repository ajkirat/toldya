import { useState } from 'react';
import type { Action } from '../gameEngine';

interface Props {
  dispatch: (a: Action) => void;
}

export default function UsernameModal({ dispatch }: Props) {
  const [name, setName] = useState('');

  function handleSubmit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    dispatch({ type: 'INIT_USER', username: trimmed });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-icon">👑</span>
          <div className="modal-title">Welcome to ToldYa</div>
          <div className="modal-subtitle">
            Predict real-world events. Prove you called it. Climb the leaderboard.
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Your predictor name
            </label>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. SharpCaller"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={20}
              autoFocus
            />
          </div>

          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 12px',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>Starting package:</div>
            <div>🪙 <strong style={{ color: 'var(--gold)' }}>1,000 coins</strong> to start predicting</div>
            <div>🎁 <strong style={{ color: 'var(--gold)' }}>+50 bonus</strong> daily login reward</div>
            <div>🔥 <strong style={{ color: 'var(--orange)' }}>Streaks</strong> unlock bigger daily bonuses</div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleSubmit}
            disabled={name.trim().length < 2}
          >
            Start Predicting →
          </button>
        </div>
      </div>
    </div>
  );
}
