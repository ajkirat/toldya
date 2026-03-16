import type { GameState, Action } from '../types';
import { getReputation, formatCount } from '../rantEngine';

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function Profile({ state }: Props) {
  const { user, rants } = state;
  if (!user) return null;

  const myRants = rants.filter(r => !r.isBot && r.author === user.username);
  const rep = getReputation(user.rantsPosted);
  const initials = user.username.slice(0, 2).toUpperCase();

  const totalReactions = myRants.reduce((sum, r) =>
    sum + Object.values(r.reactions).reduce((a, b) => a + b, 0), 0
  );

  return (
    <div className="screen">
      <div className="profile-screen">
        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-name">{user.username}</div>
          <div className="profile-rep">{rep}</div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{user.rantsPosted}</div>
            <div className="stat-label">Rants Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCount(totalReactions)}</div>
            <div className="stat-label">Reactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user.battlesWon}</div>
            <div className="stat-label">Battles Won</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCount(user.totalVotesReceived)}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
        </div>

        {/* My rants */}
        <div className="my-rants-title">My Rants ({myRants.length})</div>

        {myRants.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
            No rants yet — go say something! 😤
          </div>
        ) : (
          myRants.map(r => {
            const total = Object.values(r.reactions).reduce((a, b) => a + b, 0);
            return (
              <div key={r.id} className="my-rant-item">
                <div className="my-rant-title">{r.title}</div>
                <div className="my-rant-meta">
                  <span>🔥 {formatCount(total)} reactions</span>
                  <span>⏱ {r.duration}s</span>
                  <span>#{r.category}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
