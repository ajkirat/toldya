import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import type { GameState } from './types';
import { reducer, createInitialState, getPlayerTitle } from './gameEngine';
import type { MarketDraft } from './gameEngine';
import { createInitialMarkets } from './gameData';
import { fetchNewsMarkets } from './newsMarkets';
import {
  requestNotificationPermission,
  sendTopicNotification,
  getActiveTopics,
} from './notifications';
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
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Refs to avoid stale closures in setInterval callbacks
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const stateRef = useRef(state);

  // Keep stateRef fresh every render
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  // ── Core fetch function (stable — uses refs, safe for intervals) ───────────
  const doRefresh = useCallback(async (silent = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (!silent) setFetching(true);
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
      if (!silent) {
        // Fallback to static markets only on manual / low-count refresh
        dispatch({ type: 'ADD_MARKETS', markets: createInitialMarkets(Date.now()) as MarketDraft[] });
        setLiveStatus('error');
      }
    } finally {
      fetchingRef.current = false;
      if (!silent) setFetching(false);
    }
  }, []);

  // Manual refresh button wrapper
  const refreshMarkets = useCallback(() => doRefresh(false), [doRefresh]);

  // ── Auto news refresh every 5 minutes (silent background fetch) ────────────
  useEffect(() => {
    const id = setInterval(() => doRefresh(true), 5 * 60_000);
    return () => clearInterval(id);
  }, [doRefresh]);

  // ── Fallback: replenish immediately when running very low ──────────────────
  const openCount = state.markets.filter(m => m.status === 'open').length;
  useEffect(() => {
    const cooldown = 5 * 60_000;
    if (openCount < 5 && !fetchingRef.current && Date.now() - lastFetchRef.current > cooldown) {
      doRefresh(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCount]);

  // ── Notifications: on-mount check + hourly interval ──────────────────────
  // Key: notifications fire when you OPEN the app (not just after 60 min open)
  const NOTIF_KEY = 'toldya_last_notif';
  const NOTIF_COOLDOWN = 60 * 60_000; // 1 hour

  function maybeSendNotification() {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const lastSent = parseInt(localStorage.getItem(NOTIF_KEY) ?? '0', 10);
    if (Date.now() - lastSent < NOTIF_COOLDOWN) return;
    const { bets, markets } = stateRef.current;
    const topics = getActiveTopics(bets, markets);
    sendTopicNotification(topics, bets, markets);
    localStorage.setItem(NOTIF_KEY, String(Date.now()));
  }

  // Fire on mount (covers: "open app after an hour away")
  useEffect(() => { maybeSendNotification(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fire on hourly interval (covers: "app left open all day")
  useEffect(() => {
    const id = setInterval(maybeSendNotification, NOTIF_COOLDOWN);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notification bell handler ──────────────────────────────────────────────
  async function handleEnableNotifications() {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      // Immediate confirmation notification
      new Notification('ToldYa notifications are ON! 🔔', {
        body: "You'll get alerts every time you open the app after an hour away.",
        icon: '/icons/icon-192.png',
        tag: 'toldya-welcome',
      });
      localStorage.setItem(NOTIF_KEY, String(Date.now()));
    }
  }

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

            {/* Notification bell — visible unless browser has permanently denied */}
            {typeof Notification !== 'undefined' && notifPermission !== 'denied' && (
              <button
                className="header-daily-btn"
                onClick={notifPermission === 'granted' ? undefined : handleEnableNotifications}
                title={
                  notifPermission === 'granted'
                    ? 'Hourly notifications ON ✓'
                    : 'Tap to enable hourly prediction alerts'
                }
                style={{
                  cursor: notifPermission === 'granted' ? 'default' : 'pointer',
                  color: notifPermission === 'granted' ? 'var(--yes)' : 'var(--muted)',
                  fontSize: '1rem',
                }}
              >
                {notifPermission === 'granted' ? '🔔' : '🔕'}
              </button>
            )}

            {/* Live news refresh button */}
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
