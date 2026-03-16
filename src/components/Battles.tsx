import type { GameState, Action } from '../types';
import { haptic } from '../rantEngine';
import { sfxVote } from '../sfx';

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function Battles({ state, dispatch }: Props) {
  const { battles, rants } = state;

  function vote(battleId: string, side: 'a' | 'b') {
    haptic('heavy');
    sfxVote();
    dispatch({ type: 'VOTE_BATTLE', battleId, side });
  }

  return (
    <div className="screen">
      <div className="battles-screen">
        <div className="battles-header">Rant Battles ⚔️</div>
        <div className="battles-sub">Tap the rant you think hits harder</div>

        {battles.map(battle => {
          const rantA = rants.find(r => r.id === battle.rantAId);
          const rantB = rants.find(r => r.id === battle.rantBId);
          if (!rantA || !rantB) return null;

          const total = battle.votesA + battle.votesB;
          const pctA = total > 0 ? Math.round((battle.votesA / total) * 100) : 50;
          const pctB = 100 - pctA;
          const voted = battle.userVote !== null;

          return (
            <div key={battle.id} className="battle-card">
              <div className="battle-versus-wrap">
                {/* Side A */}
                <button
                  className={`battle-side ${
                    voted
                      ? battle.userVote === 'a' ? 'voted-win' : 'voted-lose'
                      : ''
                  }`}
                  onClick={() => !voted && vote(battle.id, 'a')}
                  disabled={voted}
                >
                  <div className="battle-author">{rantA.author}</div>
                  <div className="battle-rant-title">{rantA.title}</div>
                </button>

                <div className="battle-divider" />
                <div className="vs-badge">VS</div>

                {/* Side B */}
                <button
                  className={`battle-side ${
                    voted
                      ? battle.userVote === 'b' ? 'voted-win' : 'voted-lose'
                      : ''
                  }`}
                  onClick={() => !voted && vote(battle.id, 'b')}
                  disabled={voted}
                >
                  <div className="battle-author">{rantB.author}</div>
                  <div className="battle-rant-title">{rantB.title}</div>
                </button>
              </div>

              {/* Vote bar + percentages */}
              <div className="battle-vote-bar">
                <div className="vote-bar-a" style={{ width: `${voted ? pctA : 50}%` }} />
                <div className="vote-bar-b" style={{ width: `${voted ? pctB : 50}%` }} />
              </div>

              {voted ? (
                <div className="battle-vote-pcts">
                  <span className="a">{pctA}% 🔥</span>
                  <span className="b">{pctB}% 🔥</span>
                </div>
              ) : (
                <div className="vote-prompt">Tap a side to vote</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
