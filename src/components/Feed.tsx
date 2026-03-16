import type { GameState, Action, RantCategory } from '../types';
import { DAILY_PROMPTS } from '../rantData';
import { haptic } from '../rantEngine';
import { sfxFab } from '../sfx';
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
      <div className="feed-header">ran<span>tr</span></div>

      {/* Category filter */}
      <div className="category-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`cat-tab ${state.filter === c.key ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_FILTER', filter: c.key })}
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
    </div>
  );
}
