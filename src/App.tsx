import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import type { GameState } from './types';
import { reducer, createInitialState, getPlayerTitle } from './gameEngine';
import type { MarketDraft } from './gameEngine';
import { createInitialMarkets } from './gameData';
import { fetchNewsMarkets } from './newsMarkets';
import UsernameModal from './components/UsernameModal';
import DailyBonus from './components/DailyBonus';
import Toast from './components/Toast';
import NavBar from './components/NavBar';
import MarketList from './components/MarketList';
import MarketDetail from './components/MarketDetail';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';

const STORAGE_KEY = 'predictx_v1';

function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

function initState(): GameState {
  return loadState() ?? createInitialState();
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const [fetching, setFetching] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const lastFetchRef = useRef<number>(0);

  // Persist state on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // On mount: check daily bonus and resolve any expired markets
  useEffect(() => {
    dispatch({ type: 'CHECK_DAILY_BONUS' });
    dispatch({ type: 'RESOLVE_MARKETS' });
  }, []);

  // Auto-resolve markets every 60 seconds
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'RESOLVE_MARKETS' }), 60_000);
    return () => clearInterval(id);
  }, []);

  const refreshMarkets = useCallback(async () => {
    if (fetching) return;
    setFetching(true);
    try {
      lastFetchRef.current = Date.now();
      const markets = await fetchNewsMarkets();
      if (markets.length > 0) {
        dispatch({ type: 'ADD_MARKETS', markets });
        setLiveStatus('ok');
      } else {
        throw new Error('empty');
      }
    } catch {
      // Fall back to static markets
      dispatch({ type: 'ADD_MARKETS', markets: createInitialMarkets(Date.now()) as MarketDraft[] });
      setLiveStatus('error');
    } finally {
      setFetching(false);
    }
  }, [fetching]);

  // Auto-replenish when running low (at most once every 5 min)
  const openCount = state.markets.filter(m => m.status === 'open').length;
  useEffect(() => {
    const cooldown = 5 * 60 * 1000;
    if (openCount < 5 && !fetching && Date.now() - lastFetchRef.current > cooldown) {
      refreshMarkets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCount]);

  const { user, markets, bets, view, selectedMarketId, showUsernameModal, showDailyBonus, dailyBonusAmount, toast } = state;

  const selectedMarket = selectedMarketId
    ? markets.find(m => m.id === selectedMarketId) ?? null
    : null;

  function renderContent() {
    if (view === 'market' && selectedMarket && user) {
      return (
        <MarketDetail
          market={selectedMarket}
          bets={bets}
          user={user}
          dispatch={dispatch}
        />
      );
    }
    if (view === 'profile' && user) {
      return <Profile user={user} bets={bets} markets={markets} />;
    }
    if (view === 'leaderboard' && user) {
      return <Leaderboard user={user} />;
    }
    return <MarketList markets={markets} bets={bets} dispatch={dispatch} />;
  }

  return (
    <div className="app">
      {/* ── App Header ─────────────────────────────────────────────────────── */}
      {user && (
        <header className="app-header">
          <div className="header-brand">ToldYa</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.03em' }}>
              {getPlayerTitle(user)}
            </div>
            <div className="header-balance">
              🪙 {user.coins.toLocaleString()}
            </div>
            {user.streak > 0 && (
              <div className="header-streak">🔥 {user.streak}</div>
            )}
            {user.lastDailyBonusDate !== new Date().toISOString().split('T')[0] && (
              <button
                className="header-daily-btn"
                onClick={() => dispatch({ type: 'CHECK_DAILY_BONUS' })}
              >
                🎁
              </button>
            )}
            <button
              onClick={refreshMarkets}
              disabled={fetching}
              title={liveStatus === 'ok' ? 'Live news active — click to refresh' : 'Fetch live markets from news'}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: fetching ? 'var(--muted)' : liveStatus === 'ok' ? 'var(--yes)' : 'var(--primary)',
                padding: '4px 8px',
                fontSize: '0.8rem',
                cursor: fetching ? 'default' : 'pointer',
                transition: 'color 0.2s',
              }}
            >
              {fetching ? '⟳' : liveStatus === 'ok' ? '🌐' : '📡'}
            </button>
          </div>
        </header>
      )}

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="app-main">
        {renderContent()}
      </main>

      {/* ── Bottom Nav ─────────────────────────────────────────────────────── */}
      {user && (
        <NavBar view={view} dispatch={dispatch} />
      )}

      {/* ── Overlays ───────────────────────────────────────────────────────── */}
      {showUsernameModal && (
        <UsernameModal dispatch={dispatch} />
      )}

      {showDailyBonus && user && (
        <DailyBonus
          bonusAmount={dailyBonusAmount}
          streak={user.streak}
          dispatch={dispatch}
        />
      )}

      {toast && (
        <Toast toast={toast} dispatch={dispatch} />
      )}
    </div>
  );
}
