import { useState } from 'react';
import type { Action } from '../types';

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
          <div className="modal-icon">😤</div>
          <div className="modal-title">Welcome to rantr</div>
          <div className="modal-subtitle">
            Record your rants. Get reactions. Battle for the top spot.
          </div>
        </div>
        <div className="modal-body">
          <div>
            <div className="modal-label">Your ranter name</div>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. AngryAndrew"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={20}
              autoFocus
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={name.trim().length < 2}
          >
            Start Ranting 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
