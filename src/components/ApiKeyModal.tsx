import { useState } from 'react';

interface Props {
  currentKey: string;
  fetching: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function ApiKeyModal({ currentKey, fetching, onSave, onClose }: Props) {
  const [input, setInput] = useState(currentKey);
  const masked = currentKey ? `${currentKey.slice(0, 8)}${'•'.repeat(16)}` : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🌐</span>
          <div className="modal-title">Live Markets</div>
          <div className="modal-subtitle">
            Connect your Anthropic API key to get prediction questions powered by real current events.
          </div>
        </div>

        <div className="modal-body">
          {currentKey && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 12px',
              fontSize: '0.78rem',
              color: 'var(--yes)',
              marginBottom: '4px',
            }}>
              ✓ Live markets active — {masked}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Anthropic API Key
            </label>
            <input
              className="modal-input"
              type="password"
              placeholder="sk-ant-..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.startsWith('sk-') && onSave(input.trim())}
              autoFocus
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              Get a free key at{' '}
              <span style={{ color: 'var(--primary)' }}>console.anthropic.com</span>
            </div>
          </div>

          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 12px',
            fontSize: '0.76rem',
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}>
            <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>How it works</div>
            <div>🗞️ When markets run low, Claude generates 8 fresh questions based on real events happening today — sports, politics, finance, tech.</div>
            <div style={{ marginTop: '4px' }}>🔑 Your key is stored only in your browser. Never sent anywhere except Anthropic.</div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-full"
              onClick={() => onSave(input.trim())}
              disabled={fetching || !input.startsWith('sk-')}
            >
              {fetching ? '⟳ Fetching live markets…' : currentKey ? 'Update & Refresh' : 'Enable Live Markets'}
            </button>
            {currentKey && (
              <button
                className="btn btn-ghost"
                onClick={() => onSave('')}
                style={{ flexShrink: 0, borderColor: 'rgba(239,68,68,0.4)', color: 'var(--no)' }}
              >
                Remove
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center', width: '100%' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
