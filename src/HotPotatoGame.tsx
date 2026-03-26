import { useReducer, useEffect, useRef } from 'react'
import { gameReducer, initialState } from './gameEngine'
import { Player } from './types'
import StartScreen from './components/StartScreen'
import Countdown from './components/Countdown'
import GameScreen from './components/GameScreen'
import RoundResult from './components/RoundResult'
import GameOver from './components/GameOver'
import { playPass, playExplosion, playWin, playTick, playCountdown } from './sfx'

export default function HotPotatoGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const lastTickSound = useRef(0)

  // Countdown: fire one tick per second
  useEffect(() => {
    if (state.screen !== 'countdown') return
    playCountdown(state.countdownValue <= 1)
    const t = setTimeout(() => dispatch({ type: 'COUNTDOWN_TICK' }), 1000)
    return () => clearTimeout(t)
  }, [state.screen, state.countdownValue])

  // Game timer: 100ms ticks
  useEffect(() => {
    if (state.screen !== 'playing') return
    const interval = setInterval(() => dispatch({ type: 'TICK', delta: 100 }), 100)
    return () => clearInterval(interval)
  }, [state.screen])

  // Explosion when time hits zero
  useEffect(() => {
    if (state.screen === 'playing' && state.timeRemaining <= 0) {
      dispatch({ type: 'EXPLODE' })
      playExplosion()
    }
  }, [state.timeRemaining, state.screen])

  // Tick sounds with increasing frequency as time runs out
  useEffect(() => {
    if (state.screen !== 'playing' || state.timeRemaining <= 0) return
    const pct = state.timeRemaining / state.totalTime
    const interval = pct < 0.2 ? 150 : pct < 0.4 ? 280 : pct < 0.65 ? 500 : 900
    const now = Date.now()
    if (now - lastTickSound.current >= interval) {
      lastTickSound.current = now
      playTick()
    }
  }, [state.timeRemaining, state.screen, state.totalTime])

  // Win fanfare on game over
  useEffect(() => {
    if (state.screen === 'gameOver') playWin()
  }, [state.screen])

  const handlePass = (player: Player) => {
    if (state.currentHolder === player && state.screen === 'playing') {
      dispatch({ type: 'PASS_POTATO', player })
      playPass()
    }
  }

  switch (state.screen) {
    case 'menu':
      return <StartScreen onStart={() => dispatch({ type: 'START_GAME' })} />
    case 'countdown':
      return <Countdown value={state.countdownValue} />
    case 'playing':
      return <GameScreen state={state} onPass={handlePass} />
    case 'roundOver':
      return (
        <RoundResult
          loser={state.roundLoser!}
          scores={state.scores}
          round={state.round}
          onContinue={() => dispatch({ type: 'NEXT_ROUND' })}
        />
      )
    case 'gameOver':
      return (
        <GameOver
          winner={state.matchWinner!}
          scores={state.scores}
          onPlayAgain={() => dispatch({ type: 'PLAY_AGAIN' })}
        />
      )
  }
}
