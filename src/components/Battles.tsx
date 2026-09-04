import { useState, useEffect, useRef } from 'react';
import type { GameState, Action, Rant } from '../types';
import { haptic } from '../rantEngine';


const CATEGORY_EMOJI: Record<string, string> = {
  work: '💼', life: '🏠', tech: '💻',
  politics: '🗳️', sports: '⚽', relationships: '💔', all: '🔥',
};

const CATEGORY_BG: Record<string, string> = {
  work: '#FFFEF0', life: '#F0FFF4', tech: '#EFF6FF',
  politics: '#FAF5FF', sports: '#FFF7ED', relationships: '#FFF1F2', all: '#FFFBF5',
};

const WIN_MSGS = [
  'you\'re riding with the majority 🔥',
  'crowd agrees with you on this one',
  'rant radar is locked in',
  'you and the masses are aligned',
  'popular opinion — and you nailed it',
];

const UNDERDOG_MSGS = [
  'bold pick — you\'re in the minority ✊',
  'contrarian mode activated',
  'rare take. respect.',
  'going against the grain — classic you',
  'few feel this way. you do. own it.',
];

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickChallenger(rants: Rant[], excludeId: string): Rant {
  const pool = rants.filter(r => r.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Props {
  state: GameState;
  dispatch: (a: Action) => void;
}

export default function Battles({ state, dispatch }: Props) {
  const { rants } = state;

  const [rantA, setRantA]   = useState<Rant>(() => rants[0]);
  const [rantB, setRantB]   = useState<Rant>(() => pickChallenger(rants, rants[0].id));
  const [votesA, setVotesA] = useState(() => randBetween(120, 500));
  const [votesB, setVotesB] = useState(() => randBetween(120, 500));
  const [voted, setVoted]   = useState<'a' | 'b' | null>(null);
  const [newSide, setNewSide] = useState<'a' | 'b' | null>(null);
  const [round, setRound]   = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function vote(side: 'a' | 'b') {
    if (voted !== null) return;
    haptic('heavy');
    if (side === 'a') setVotesA(v => v + 1);
    else setVotesB(v => v + 1);
    setVoted(side);

    timerRef.current = setTimeout(() => {
      if (side === 'a') {
        const next = pickChallenger(rants, rantA.id);
        setRantB(next);
        setVotesB(randBetween(80, 400));
        setNewSide('b');
      } else {
        const next = pickChallenger(rants, rantB.id);
        setRantA(next);
        setVotesA(randBetween(80, 400));
        setNewSide('a');
      }
      setVoted(null);
      setRound(r => r + 1);
      setTimeout(() => setNewSide(null), 400);
    }, 1900);
  }

  const total = votesA + votesB;
  const pctA  = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB  = 100 - pctA;

  function affirmMsg(): string {
    if (!voted) return '';
    const userPct = voted === 'a' ? pctA : pctB;
    const pool = userPct >= 50 ? WIN_MSGS : UNDERDOG_MSGS;
    return pool[round % pool.length];
  }

  return (
    <div className="screen btl-screen">

      {/* Header */}
      <div className="btl-header-row">
        <div className="btl-title">⚔️ Battles</div>
        <div className="btl-round">round #{round}</div>
      </div>
      <div className="btl-sub">tap the rant that hits harder</div>

      {/* Arena */}
      <div className="btl-arena">

        {/* Card A */}
        <div
          className={`btl-card${voted === 'a' ? ' btl-card--winner' : ''}${voted === 'b' ? ' btl-card--loser' : ''}${newSide === 'a' ? ' btl-card--enter' : ''}`}
          style={{ background: CATEGORY_BG[rantA.category] }}
          onClick={() => vote('a')}
        >
          <div className="btl-card-cat">{CATEGORY_EMOJI[rantA.category]} {rantA.category}</div>
          <div className="btl-card-title">"{rantA.title}"</div>
          <div className="btl-card-author">— {rantA.author}</div>
          {voted === 'a' && <div className="btl-badge">✓ your pick</div>}
        </div>

        {/* VS / Stats strip */}
        <div className="btl-vs-strip">
          {voted ? (
            <div className="btl-stats">
              <span className="btl-pct btl-pct--a">{pctA}%</span>
              <div className="btl-bar">
                <div className="btl-bar-a" style={{ width: `${pctA}%` }} />
                <div className="btl-bar-b" style={{ width: `${pctB}%` }} />
              </div>
              <span className="btl-pct btl-pct--b">{pctB}%</span>
            </div>
          ) : (
            <span className="btl-vs-text">VS</span>
          )}
        </div>

        {/* Card B */}
        <div
          className={`btl-card${voted === 'b' ? ' btl-card--winner' : ''}${voted === 'a' ? ' btl-card--loser' : ''}${newSide === 'b' ? ' btl-card--enter' : ''}`}
          style={{ background: CATEGORY_BG[rantB.category] }}
          onClick={() => vote('b')}
        >
          <div className="btl-card-cat">{CATEGORY_EMOJI[rantB.category]} {rantB.category}</div>
          <div className="btl-card-title">"{rantB.title}"</div>
          <div className="btl-card-author">— {rantB.author}</div>
          {voted === 'b' && <div className="btl-badge">✓ your pick</div>}
        </div>

      </div>

      {/* Affirmative */}
      {voted && (
        <div className="btl-affirm" key={round}>
          {affirmMsg()}
        </div>
      )}

      {!voted && (
        <div className="btl-hint">
          next challenger auto-loads after you vote
        </div>
      )}

    </div>
  );
}
