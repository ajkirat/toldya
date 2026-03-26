import { Player, WINS_REQUIRED } from '../types'

interface Props {
  loser: Player
  scores: [number, number]
  round: number
  onContinue: () => void
}

export default function RoundResult({ loser, scores, onContinue }: Props) {
  return (
    <div className="screen result-screen">
      <div className="result-boom">💥</div>
      <div className="result-msg">Player {loser + 1} got burned!</div>
      <div className="result-scores">
        <div className={`rscore ${scores[0] > scores[1] ? 'leading' : ''}`}>
          <span className="rscore-label">P1</span>
          <span className="rscore-num">{scores[0]}</span>
        </div>
        <div className="rscore-sep">vs</div>
        <div className={`rscore ${scores[1] > scores[0] ? 'leading' : ''}`}>
          <span className="rscore-label">P2</span>
          <span className="rscore-num">{scores[1]}</span>
        </div>
      </div>
      <div className="result-note">First to {WINS_REQUIRED} wins 🏆</div>
      <button className="btn-continue" onClick={onContinue}>
        NEXT ROUND →
      </button>
    </div>
  )
}
