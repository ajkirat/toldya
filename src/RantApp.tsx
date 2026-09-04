import { useReducer, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { reducer, createInitialState, formatCount, haptic } from './rantEngine';
import { DAILY_PROMPTS } from './rantData';
import { sfxNav } from './sfx';
import UsernameModal from './components/UsernameModal';
import Toast from './components/Toast';
import NavBar from './components/NavBar';
import RantRelay from './components/RantRelay';
import RecordScreen from './components/RecordScreen';
import Battles from './components/Battles';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import ShareCard from './components/ShareCard';
import VibeCheck from './components/VibeCheck';

const STORAGE_KEY = 'rantr_v1';

function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export default function RantApp() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    return loadState() ?? createInitialState();
  });

  // Persist on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full — strip audio from oldest user rants
      const trimmed = {
        ...state,
        rants: state.rants.map(r => (!r.isBot ? { ...r, audioBase64: undefined } : r)),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch { /* ignore */ }
    }
  }, [state]);

  const stableDispatch = useCallback(dispatch, []);

  // Deep-link: if URL has ?vibe=inv or ?vibe=res, auto-navigate to vibe screen
  useEffect(() => {
    const vibeParam = new URLSearchParams(window.location.search).get('vibe');
    if ((vibeParam === 'inv' || vibeParam === 'res') && state.view !== 'vibe') {
      stableDispatch({ type: 'NAVIGATE', view: 'vibe' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = state.user?.avatar ?? state.user?.username.slice(0, 2).toUpperCase() ?? '?';
  const totalReactions = state.rants.reduce(
    (sum, r) => sum + Object.values(r.reactions).reduce((a, b) => a + b, 0), 0
  );
  const liveCount = formatCount(Math.max(2400, Math.floor(totalReactions / 12)));
  const todayPrompt = DAILY_PROMPTS[new Date().getDay()];
  const sortedRants = [...state.rants].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="app">
      {state.showUsernameModal && <UsernameModal dispatch={stableDispatch} />}

      {state.view !== 'share' && (
        <header className="app-header">
          <div className="header-brand">
            <span className="brand-emoji">😤</span>
            <span className="brand-name">ran<span>tr</span></span>
          </div>
          <div className="header-right">
            <div className="live-pill">🔥 {liveCount} live</div>
            <button
              className="header-icon-btn"
              onClick={() => { haptic('light'); sfxNav(); stableDispatch({ type: 'NAVIGATE', view: 'leaderboard' }); }}
              aria-label="Leaderboard"
            >🏆</button>
            <button
              className="header-avatar"
              onClick={() => { haptic('light'); sfxNav(); stableDispatch({ type: 'NAVIGATE', view: 'profile' }); }}
              aria-label="Profile"
            >{initials}</button>
          </div>
        </header>
      )}

      {state.view === 'feed' && sortedRants.length > 0 && (
        <RantRelay
          rants={sortedRants}
          userReactions={state.userReactions}
          dispatch={stableDispatch}
          todayPrompt={todayPrompt}
        />
      )}
      {state.view === 'feed' && sortedRants.length === 0 && (
        <div className="screen">
          <div className="feed-empty">
            <div className="feed-empty-icon">🎙️</div>
            <div className="feed-empty-title">No rants yet</div>
            <div className="feed-empty-sub">Be the first to rage. Drop a rant and start the fire.</div>
            <button
              className="btn-primary feed-empty-cta"
              onClick={() => { haptic('medium'); stableDispatch({ type: 'NAVIGATE', view: 'record' }); }}
            >
              🎤 Record your first rant
            </button>
          </div>
        </div>
      )}
      {state.view === 'record'      && <RecordScreen state={state} dispatch={stableDispatch} />}
      {state.view === 'battles'     && <Battles      state={state} dispatch={stableDispatch} />}
      {state.view === 'leaderboard' && <Leaderboard  state={state} dispatch={stableDispatch} />}
      {state.view === 'profile'     && <Profile      state={state} dispatch={stableDispatch} />}
      {state.view === 'vibe'        && <VibeCheck    username={state.user?.username ?? 'Ranter'} />}
      {state.view === 'share' && state.sharedRantId && (
        <ShareCard
          rant={state.rants.find(r => r.id === state.sharedRantId)!}
          dispatch={stableDispatch}
        />
      )}

      {state.view !== 'share' && <NavBar view={state.view} dispatch={stableDispatch} />}
      {state.toast && <Toast toast={state.toast} dispatch={stableDispatch} />}
    </div>
  );
}
