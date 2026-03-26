export type Screen = 'menu' | 'countdown' | 'playing' | 'roundOver' | 'gameOver'
export type Player = 0 | 1

export interface GameState {
  screen: Screen
  scores: [number, number]
  currentHolder: Player
  timeRemaining: number
  totalTime: number
  round: number
  roundLoser: Player | null
  matchWinner: Player | null
  countdownValue: number
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'PASS_POTATO'; player: Player }
  | { type: 'TICK'; delta: number }
  | { type: 'EXPLODE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'PLAY_AGAIN' }

export const WINS_REQUIRED = 3
export const INITIAL_TIME = 8000   // ms
export const TIME_REDUCTION = 600  // ms per round
export const MIN_TIME = 2500       // ms minimum
