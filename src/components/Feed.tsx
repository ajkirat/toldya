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

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function Feed({ state, dispatch }: Props) {
  const prompt = DAILY_PROMPTS[new Date().getDay()];

  const filteredRants = state.filter === 'all'
    ? state.rants
    : state.rants.filter(r => r.category === state.filter);

  return (
    <div className="screen">
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

      {/* Orange prompt strip */}
      <div
        className="prompt-strip"
        onClick={() => {
          haptic('medium');
          sfxFab();
          dispatch({ type: 'NAVIGATE', view: 'record' });
        }}
      >
        <div>
          <div className="prompt-strip-label">🎙️ Today's Prompt</div>
          <div className="prompt-strip-title">{prompt}</div>
        </div>
        <button className="prompt-strip-cta" onClick={e => { e.stopPropagation(); haptic('medium'); dispatch({ type: 'NAVIGATE', view: 'record' }); }}>
          Rant it →
        </button>
      </div>

      {/* Rant list */}
      {filteredRants.length === 0 ? (
        <div className="feed-empty">
          <div className="feed-empty-icon">🦗</div>
          No rants here yet. Be the first!
        </div>
      ) : (
        <div className="feed-list">
          {filteredRants.map(r => (
            <RantCard
              key={r.id}
              rant={r}
              userReactions={state.userReactions[r.id] ?? []}
              dispatch={dispatch}
              onExpand={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
