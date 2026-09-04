import type { View, Action } from '../types';
import { haptic } from '../rantEngine';
import { sfxNav, sfxFab } from '../sfx';

const TABS: { view: View; icon: string; label: string; isRecord?: boolean }[] = [
  { view: 'feed',    icon: '🔥', label: 'Feed' },
  { view: 'record',  icon: '🎙️', label: 'Rant', isRecord: true },
  { view: 'battles', icon: '⚔️',  label: 'Battles' },
  { view: 'vibe',    icon: '💢',  label: 'Vibe' },
];

interface Props {
  view: View;
  dispatch: (a: Action) => void;
}

export default function NavBar({ view, dispatch }: Props) {
  function navigate(v: View, isRecord?: boolean) {
    haptic('light');
    if (isRecord) sfxFab(); else sfxNav();
    dispatch({ type: 'NAVIGATE', view: v });
  }

  return (
    <nav className="nav-bar">
      {TABS.map(t => (
        <button
          key={t.view}
          className={`nav-tab ${t.isRecord ? 'record-tab' : ''} ${view === t.view ? 'active' : ''}`}
          onClick={() => navigate(t.view, t.isRecord)}
        >
          <span className="nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
