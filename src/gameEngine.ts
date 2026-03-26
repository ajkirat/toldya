import { GameState, GameAction, Player, WINS_REQUIRED, INITIAL_TIME, TIME_REDUCTION, MIN_TIME } from './types'

export const initialState: GameState = {
  screen: 'menu',
  scores: [0, 0],
  currentHolder: 0,
  timeRemaining: INITIAL_TIME,
  totalTime: INITIAL_TIME,
  round: 0,
  roundLoser: null,
  matchWinner: null,
  countdownValue: 3,
}

function randomPlayer(): Player {
  return Math.random() < 0.5 ? 0 : 1
}

function timeForRound(round: number): number {
  return Math.max(MIN_TIME, INITIAL_TIME - round * TIME_REDUCTION)
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        screen: 'countdown',
        countdownValue: 3,
        currentHolder: randomPlayer(),
        timeRemaining: INITIAL_TIME,
        totalTime: INITIAL_TIME,
      }

    case 'COUNTDOWN_TICK':
      if (state.countdownValue <= 1) return { ...state, screen: 'playing' }
      return { ...state, countdownValue: state.countdownValue - 1 }

    case 'PASS_POTATO': {
      if (state.screen !== 'playing') return state
      if (action.player !== state.currentHolder) return state
      const other: Player = state.currentHolder === 0 ? 1 : 0
      return { ...state, currentHolder: other }
    }

    case 'TICK': {
      if (state.screen !== 'playing') return state
      return { ...state, timeRemaining: Math.max(0, state.timeRemaining - action.delta) }
    }

    case 'EXPLODE': {
      if (state.screen !== 'playing') return state
      const loser = state.currentHolder
      const other: Player = loser === 0 ? 1 : 0
      const newScores: [number, number] = [state.scores[0], state.scores[1]]
      newScores[other] += 1
      const matchWinner = newScores[other] >= WINS_REQUIRED ? other : null
      return {
        ...state,
        screen: matchWinner !== null ? 'gameOver' : 'roundOver',
        scores: newScores,
        roundLoser: loser,
        matchWinner,
      }
    }

    case 'NEXT_ROUND': {
      const newRound = state.round + 1
      const time = timeForRound(newRound)
      return {
        ...state,
        screen: 'countdown',
        round: newRound,
        timeRemaining: time,
        totalTime: time,
        // loser of last round starts with the potato — punishment!
        currentHolder: state.roundLoser ?? randomPlayer(),
        roundLoser: null,
        countdownValue: 3,
      }
    }

    case 'PLAY_AGAIN':
      return { ...initialState }

    default:
      return state
  }
}
