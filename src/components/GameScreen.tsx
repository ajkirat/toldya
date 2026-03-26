import { GameState } from '../types'
import PlayerZone from './PlayerZone'
import PotatoDisplay from './PotatoDisplay'

interface Props {
  state: GameState
  onPass: (player: 0 | 1) => void
}

export default function GameScreen({ state, onPass }: Props) {
  const pct = state.timeRemaining / state.totalTime
  return (
    <div className={`game-screen ${pct < 0.2 ? 'critical' : ''}`}>
      <PlayerZone
        player={1}
        isHolder={state.currentHolder === 1}
        score={state.scores[1]}
        onTap={() => onPass(1)}
        flipped
      />
      <PotatoDisplay
        timeRemaining={state.timeRemaining}
        totalTime={state.totalTime}
      />
      <PlayerZone
        player={0}
        isHolder={state.currentHolder === 0}
        score={state.scores[0]}
        onTap={() => onPass(0)}
        flipped={false}
      />
    </div>
  )
}
