import { Player } from '../types'

interface Props {
  winner: Player
  scores: [number, number]
  onPlayAgain: () => void
}

export default function GameOver({ winner, scores, onPlayAgain }: Props) {
  return (
    <div className="screen gameover-screen">
      <div className="trophy">🏆</div>
      <div className="winner-msg">PLAYER {winner + 1} WINS!</div>
      <div className="final-score">{scores[0]} — {scores[1]}</div>
      <button className="btn-play-again" onClick={onPlayAgain}>
        PLAY AGAIN!
      </button>
    </div>
  )
}
