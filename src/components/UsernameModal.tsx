import { useState } from 'react';
import type { Action } from '../types';
import { haptic } from '../rantEngine';
import { sfxWelcome } from '../sfx';

const AVATARS = ['😤', '🔥', '💀', '⚡', '🤬', '😡', '💢', '🗯️', '👊', '🤯', '😈', '🌋'];

interface Props {
  dispatch: (a: Action) => void;
}

export default function UsernameModal({ dispatch }: Props) {
  const [name, setName]     = useState('');
  const [avatar, setAvatar] = useState('😤');

  function handleSubmit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    haptic('medium');
    sfxWelcome();
    dispatch({ type: 'INIT_USER', username: trimmed, avatar });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-icon">{avatar}</div>
          <div className="modal-title">rant first. think never.</div>
          <div className="modal-subtitle">
            no responsibility. no chill. no regrets.
          </div>
        </div>

        {/* Avatar picker */}
        <div className="modal-avatar-section">
          <div className="modal-label">pick your rage face</div>
          <div className="modal-avatar-grid">
            {AVATARS.map(em => (
              <button
                key={em}
                className={`modal-avatar-btn${avatar === em ? ' selected' : ''}`}
                onClick={() => { haptic('light'); setAvatar(em); }}
                aria-label={em}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-features">
          <div className="modal-feature-item">🎙️ record a rant in 15 seconds flat</div>
          <div className="modal-feature-item">🔥 get reactions from the community</div>
          <div className="modal-feature-item">⚔️ battle other ranters head-to-head</div>
          <div className="modal-feature-item">🏆 climb the leaderboard of rage</div>
        </div>

        <div className="modal-body">
          <div>
            <div className="modal-label">what do they call you when you lose it?</div>
            <input
              className="modal-input"
              type="text"
              placeholder="e.g. FuriousFatima, AngryAndrew"
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
            unleash it {avatar}
          </button>
        </div>
      </div>
    </div>
  );
}
