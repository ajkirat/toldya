import type { View } from '../types';
import type { Action } from '../gameEngine';

interface Props {
  view: View;
  dispatch: (a: Action) => void;
}

const TABS: { view: View; icon: string; label: string }[] = [
  { view: 'home',        icon: '📊', label: 'Markets'  },
  { view: 'leaderboard', icon: '🏆', label: 'Rankings'  },
  { view: 'profile',     icon: '👤', label: 'Profile'   },
];

export default function NavBar({ view, dispatch }: Props) {
  const activeView = view === 'market' ? 'home' : view;

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.view}
          className={`nav-btn ${activeView === tab.view ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'NAVIGATE', view: tab.view })}
        >
          <span className="nav-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
