import { useState } from 'react'
import { WINS_REQUIRED } from '../types'

interface Props {
  player: 0 | 1
  isHolder: boolean
  score: number
  onTap: () => void
  flipped: boolean
}

export default function PlayerZone({ player, isHolder, score, onTap, flipped }: Props) {
  const [flash, setFlash] = useState(false)

  const handleTap = () => {
    if (!isHolder) return
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
    onTap()
  }

  const dots = Array.from({ length: WINS_REQUIRED }, (_, i) => (
    <span key={i} className={`score-dot ${i < score ? 'filled' : ''}`} />
  ))

  return (
    <div
      className={`player-zone player-${player} ${isHolder ? 'is-holder' : 'is-waiting'} ${flipped ? 'flipped' : ''} ${flash ? 'tapped' : ''}`}
      onTouchStart={handleTap}
      onClick={handleTap}
    >
      <div className="zone-content">
        <div className="player-label">PLAYER {player + 1}</div>
        <div className="score-dots">{dots}</div>
        <div className="zone-status">
          {isHolder ? '🔥 TAP TO PASS! 🔥' : '⏳ WAIT...'}
        </div>
      </div>
      {flash && <div className="tap-flash" />}
    </div>
  )
}
