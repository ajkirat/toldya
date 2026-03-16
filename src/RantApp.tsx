import { useReducer, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { reducer, createInitialState } from './rantEngine';
import UsernameModal from './components/UsernameModal';
import Toast from './components/Toast';
import NavBar from './components/NavBar';
import Feed from './components/Feed';
import RecordScreen from './components/RecordScreen';
import Battles from './components/Battles';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import ShareCard from './components/ShareCard';

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
      // Don't persist audio blobs if they're huge; keep base64 strings as-is
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

  return (
    <div className="app">
      {state.showUsernameModal && <UsernameModal dispatch={stableDispatch} />}

      {state.view === 'feed'        && <Feed        state={state} dispatch={stableDispatch} />}
      {state.view === 'record'      && <RecordScreen state={state} dispatch={stableDispatch} />}
      {state.view === 'battles'     && <Battles     state={state} dispatch={stableDispatch} />}
      {state.view === 'leaderboard' && <Leaderboard state={state} dispatch={stableDispatch} />}
      {state.view === 'profile'     && <Profile     state={state} dispatch={stableDispatch} />}
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
