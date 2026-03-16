import type { GameState, Action, RantCategory } from '../types';
import { DAILY_PROMPTS } from '../rantData';
import { haptic } from '../rantEngine';
import { sfxFab, sfxNav } from '../sfx';
import RantCard from './RantCard';

const CATEGORIES: { key: RantCategory; label: string }[] = [
  { key: 'all',           label: '🔥 All' },
  { key: 'work',          label: '💼 Work' },
  { key: 'life',          label: '🏠 Life' },
  { key: 'tech',          label: '💻 Tech' },
  { key: 'politics',      label: '🗳️ Politics' },
  { key: 'sports',        label: '⚽ Sports' },
  { key: 'relationships', label: '💔 Relationships' },
];

const TICKER_ITEMS = [
  '😤 slow walkers in corridors',
  '🚗 indicators are literally free',
  '✈️ plane clappers are at it again',
  '☕ microwave fish at the office',
  '🛒 12 items in the 10-item lane',
  '📱 speakerphone on public transport',
  '🔔 reply-all email chains',
  '🎵 no headphones in quiet carriages',
  '🚰 leaving empty mugs in the sink',
  '🖨️ printer jams at deadline time',
];

const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function Feed({ state, dispatch }: Props) {
  const prompt = DAILY_PROMPTS[new Date().getDay()];
  const rants = state.filter === 'all'
    ? state.rants
    : state.rants.filter(r => r.category === state.filter);

  return (
    <div className="screen">
      <div className="feed-header">
        <div className="app-wordmark">ran<span>tr</span></div>
        <div className="app-tagline">tiny rage. big community.</div>
      </div>

      {/* Live ticker */}
      <div className="live-ticker">
        <div className="ticker-inner">
          {TICKER_DOUBLED.map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="category-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`cat-tab ${state.filter === c.key ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              sfxNav();
              dispatch({ type: 'SET_FILTER', filter: c.key });
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Daily prompt */}
      <div
        className="daily-prompt"
        onClick={() => {
          haptic('medium');
          sfxFab();
          dispatch({ type: 'NAVIGATE', view: 'record' });
        }}
      >
        <div className="daily-prompt-icon">🎙️</div>
        <div>
          <div className="daily-prompt-label">Today's rant prompt</div>
          <div className="daily-prompt-text">{prompt}</div>
        </div>
      </div>

      {/* Rant list */}
      {rants.length === 0 ? (
        <div className="feed-empty">
          <div className="feed-empty-icon">🦗</div>
          No rants here yet. Be the first!
        </div>
      ) : (
        <div className="feed-list">
          {rants.map(r => (
            <RantCard
              key={r.id}
              rant={r}
              userReactions={state.userReactions[r.id] ?? []}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}

      {/* FAB — record shortcut */}
      <button
        className="feed-fab"
        onClick={() => {
          haptic('medium');
          sfxFab();
          dispatch({ type: 'NAVIGATE', view: 'record' });
        }}
        aria-label="Record a rant"
      >
        😤
      </button>
    </div>
  );
}
