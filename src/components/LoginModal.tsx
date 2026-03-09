import { useGoogleLogin } from '@react-oauth/google';
import type { AuthState } from '../auth';

interface Props {
  onLogin: (auth: AuthState) => void;
}

const configured = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
  && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'not-configured';

export default function LoginModal({ onLogin }: Props) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json() as { sub: string; email: string; name: string; picture: string };
        onLogin({ uid: info.sub, email: info.email, name: info.name, picture: info.picture });
      } catch {
        // silently ignore — user can retry
      }
    },
  });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-icon">👑</span>
          <div className="modal-title">ToldYa</div>
          <div className="modal-subtitle">
            Predict real-world events. Prove you called it. Climb the leaderboard.
          </div>
        </div>
        <div className="modal-body">
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
            marginBottom: '8px',
          }}>
            <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>Starting package:</div>
            <div>🪙 <strong style={{ color: 'var(--gold)' }}>1,000 coins</strong> to start predicting</div>
            <div>🎁 <strong style={{ color: 'var(--gold)' }}>+50 bonus</strong> daily login reward</div>
            <div>🔥 <strong style={{ color: 'var(--orange)' }}>Streaks</strong> unlock bigger daily bonuses</div>
          </div>

          {configured ? (
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => login()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.4 5.6-5.1 7.3v6h8.2c4.8-4.4 7.2-10.9 7.2-17.4z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8.2-6c-2.1 1.4-4.8 2.2-7.7 2.2-5.9 0-10.9-4-12.7-9.4H2.8v6.2C6.7 42.9 14.8 48 24 48z"/>
                <path fill="#FBBC04" d="M11.3 29c-.5-1.4-.7-2.9-.7-4.4s.2-3 .7-4.4v-6.2H2.8C1 17.4 0 20.6 0 24s1 6.6 2.8 9.9l8.5-4.9z"/>
                <path fill="#EA4335" d="M24 9.5c3.3 0 6.3 1.1 8.6 3.3l6.4-6.4C35.9 2.8 30.4 0 24 0 14.8 0 6.7 5.1 2.8 12.6l8.5 6.2c1.8-5.4 6.8-9.3 12.7-9.3z"/>
              </svg>
              Continue with Google
            </button>
          ) : (
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 12px',
              fontSize: '0.75rem',
              color: 'var(--muted)',
              textAlign: 'center',
            }}>
              ⚙️ Add <code>VITE_GOOGLE_CLIENT_ID</code> to your environment to enable login.
            </div>
          )}

          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
            Your progress is saved to your Google account
          </p>
        </div>
      </div>
    </div>
  );
}
