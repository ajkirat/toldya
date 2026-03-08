export type MarketCategory = 'sports' | 'finance' | 'weather' | 'entertainment' | 'platform';
export type MarketStatus   = 'open' | 'resolved';
export type BetSide        = 'yes' | 'no';
export type MarketType     = 'binary' | 'mcq' | 'range';
export type View           = 'home' | 'market' | 'profile' | 'leaderboard';
export type Confidence     = 'low' | 'normal' | 'high' | 'all-in';

export interface User {
  username: string;
  coins: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;      // YYYY-MM-DD
  lastDailyBonusDate: string;  // YYYY-MM-DD
  correctPredictions: number;
  totalPredictions: number;
  totalProfit: number;
}

export interface Market {
  id: string;
  title: string;
  description: string;
  category: MarketCategory;
  type: MarketType;
  closeTime: number;               // unix ms
  status: MarketStatus;
  aiPrediction: number;            // 0–1: for binary = P(YES); for mcq/range = index of predicted winner / options.length
  aiPredictedOption?: number;      // explicit index for mcq/range
  resolvedAt: number | null;

  // ── Binary ──────────────────────────────────────────────────
  yesPool: number;
  noPool: number;
  outcome: 'yes' | 'no' | null;
  predeterminedOutcome: 'yes' | 'no';

  // ── MCQ / Range ─────────────────────────────────────────────
  options?: string[];              // option labels (3-4 entries)
  optionPools?: number[];          // pool per option
  predeterminedOptionIdx?: number; // winning option index (set at creation)
}

export interface Bet {
  id: string;
  marketId: string;
  marketTitle: string;
  side: BetSide;        // 'yes'/'no' for binary; 'yes' placeholder for mcq/range
  optionIdx?: number;   // index into market.options for mcq/range bets
  optionLabel?: string; // display label for the option chosen
  amount: number;
  confidence: Confidence;
  timestamp: number;
  probAtBet: number;    // percentage 0-100 of chosen side/option at bet time
  payout: number | null;
  profit: number | null;
  resolved: boolean;
  legendary?: boolean;  // true if underdog win (probAtBet < 30%)
}

export interface Toast {
  message: string;
  type: 'win' | 'loss' | 'info' | 'bonus' | 'legendary';
}

export interface GameState {
  user: User | null;
  markets: Market[];
  bets: Bet[];
  view: View;
  selectedMarketId: string | null;
  showUsernameModal: boolean;
  showDailyBonus: boolean;
  dailyBonusAmount: number;
  toast: Toast | null;
}
