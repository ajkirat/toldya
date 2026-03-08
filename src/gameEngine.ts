import type { GameState, Market, MarketType, Bet, BetSide, View, User, Toast, Confidence } from './types';

// ── Confidence bets ───────────────────────────────────────────────────────────

export const CONFIDENCE_MULT: Record<Confidence, number> = {
  low:    0.5,
  normal: 1,
  high:   2,
  'all-in': 3,
};

export const CONFIDENCE_META: Record<Confidence, { label: string; color: string }> = {
  low:    { label: 'LOW 0.5×',    color: 'var(--muted)' },
  normal: { label: 'NORMAL 1×',  color: 'var(--primary)' },
  high:   { label: 'HIGH 2×',    color: '#f59e0b' },
  'all-in': { label: 'ALL IN 3×', color: 'var(--no)' },
};

// ── Player identity ───────────────────────────────────────────────────────────

export function getPlayerTitle(user: User): string {
  const acc = user.totalPredictions > 0
    ? (user.correctPredictions / user.totalPredictions) * 100
    : 0;
  const n = user.totalPredictions;
  if (n >= 30 && acc >= 73) return 'Legend';
  if (n >= 20 && acc >= 66) return 'Oracle';
  if (n >= 10 && acc >= 56) return 'Sharp Analyst';
  if (n >= 5  && acc >= 40) return 'Market Reader';
  return 'Rookie Predictor';
}

export function getPredictionIQ(user: User): number {
  const acc = user.totalPredictions > 0
    ? (user.correctPredictions / user.totalPredictions) * 100
    : 50;
  const raw = 100 + (acc - 50) * 1.5 + user.bestStreak * 2 + Math.min(user.totalPredictions, 50);
  return Math.min(200, Math.max(60, Math.round(raw)));
}

export function getTopPercent(rank: number, total: number): string {
  const pct = Math.ceil((rank / total) * 100);
  if (pct <= 1)  return 'Top 1% predictor';
  if (pct <= 5)  return 'Top 5% predictor';
  if (pct <= 10) return 'Top 10% predictor';
  if (pct <= 25) return 'Top 25% predictor';
  return `Top ${pct}% predictor`;
}

// ── Pure helper functions ─────────────────────────────────────────────────────

export function getYesProb(market: Market): number {
  const total = market.yesPool + market.noPool;
  return total === 0 ? 50 : Math.round((market.yesPool / total) * 100);
}

export function getNoProb(market: Market): number {
  return 100 - getYesProb(market);
}

export function getOptionProb(market: Market, idx: number): number {
  const pools = market.optionPools ?? [];
  const total  = pools.reduce((a, b) => a + b, 0);
  if (total === 0) return Math.round(100 / (market.options?.length ?? 4));
  return Math.round(((pools[idx] ?? 0) / total) * 100);
}

export function formatCoins(n: number): string {
  return n.toLocaleString();
}

export function getTimeLeft(closeTime: number): string {
  const diff = closeTime - Date.now();
  if (diff <= 0) return 'Closed';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0)  return `${h}h ${m}m`;
  return `${m}m`;
}

export function isUrgent(closeTime: number): boolean {
  const diff = closeTime - Date.now();
  return diff > 0 && diff < 2 * 3_600_000;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateDailyBonus(streak: number): number {
  return Math.min(50 + streak * 10, 200);
}

export function calculateExpectedPayout(amount: number, side: BetSide, market: Market): number {
  const newYesPool = side === 'yes' ? market.yesPool + amount : market.yesPool;
  const newNoPool  = side === 'no'  ? market.noPool  + amount : market.noPool;
  const winPool = side === 'yes' ? newYesPool : newNoPool;
  const total   = newYesPool + newNoPool;
  if (winPool === 0) return amount * 2;
  return (amount / winPool) * total * 0.98;
}

export function calculateOptionPayout(amount: number, optionIdx: number, market: Market): number {
  const pools = [...(market.optionPools ?? [])];
  pools[optionIdx] = (pools[optionIdx] ?? 0) + amount;
  const total   = pools.reduce((a, b) => a + b, 0);
  const winPool = pools[optionIdx];
  if (winPool === 0) return amount * (market.options?.length ?? 4);
  return (amount / winPool) * total * 0.98;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type MarketDraft = {
  title: string;
  description: string;
  category: Market['category'];
  type?: MarketType;
  yesPool: number;
  noPool: number;
  aiPrediction: number;
  aiPredictedOption?: number;
  options?: string[];
  optionPools?: number[];
  closeTime?: number;
};

export type Action =
  | { type: 'INIT_USER';        username: string }
  | { type: 'CHECK_DAILY_BONUS' }
  | { type: 'CLAIM_DAILY_BONUS' }
  | { type: 'DISMISS_DAILY_BONUS' }
  | { type: 'PLACE_BET';        marketId: string; side: BetSide; amount: number; optionIdx?: number; confidence?: Confidence }
  | { type: 'RESOLVE_MARKETS' }
  | { type: 'ADD_MARKETS';      markets: MarketDraft[] }
  | { type: 'NAVIGATE';         view: View; marketId?: string }
  | { type: 'DISMISS_TOAST' };

// ── Initial state ─────────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    user: null,
    markets: [],
    bets: [],
    view: 'home',
    selectedMarketId: null,
    showUsernameModal: true,
    showDailyBonus: false,
    dailyBonusAmount: 0,
    toast: null,
  };
}

// ── Market resolution ─────────────────────────────────────────────────────────

function resolveMarketsInState(state: GameState): GameState {
  const now = Date.now();
  const toResolve = state.markets.filter(m => m.status === 'open' && m.closeTime <= now);
  if (toResolve.length === 0) return state;

  let coins   = state.user?.coins              ?? 0;
  let correct = state.user?.correctPredictions ?? 0;
  let total   = state.user?.totalPredictions   ?? 0;
  let profit  = state.user?.totalProfit        ?? 0;
  let streak  = state.user?.streak             ?? 0;
  let best    = state.user?.bestStreak         ?? 0;
  let lastToast: Toast | null = null;

  const updatedBets = state.bets.map(bet => {
    const market = toResolve.find(m => m.id === bet.marketId);
    if (!market || bet.resolved) return bet;

    total++;
    let won = false;
    let payout = 0;

    if (market.type === 'binary' || !market.type) {
      const outcome = market.predeterminedOutcome;
      won = bet.side === outcome;
      if (won) {
        const winPool   = outcome === 'yes' ? market.yesPool : market.noPool;
        const totalPool = market.yesPool + market.noPool;
        payout = Math.round((bet.amount / winPool) * totalPool * 0.98);
      }
    } else {
      // MCQ / range
      const winIdx = market.predeterminedOptionIdx ?? 0;
      won = bet.optionIdx === winIdx;
      if (won) {
        const pools     = market.optionPools ?? [];
        const totalPool = pools.reduce((a, b) => a + b, 0);
        const winPool   = pools[winIdx] ?? 0;
        payout = winPool > 0 ? Math.round((bet.amount / winPool) * totalPool * 0.98) : bet.amount * 2;
      }
    }

    if (won) {
      coins  += payout;
      profit += payout - bet.amount;
      correct++;
      streak++;
      best = Math.max(best, streak);
      const beatPct = 100 - bet.probAtBet;
      const isLegendary = bet.probAtBet < 30;
      if (isLegendary) {
        lastToast = {
          message: `🏆 LEGENDARY CALL! +${payout.toLocaleString()} coins — only ${bet.probAtBet}% believed you!`,
          type: 'legendary',
        };
      } else if (streak >= 3) {
        lastToast = {
          message: `🔥 ${streak}-streak! You called it! +${payout.toLocaleString()} coins · Beat ${beatPct}% of players`,
          type: 'win',
        };
      } else {
        lastToast = {
          message: `YOU CALLED IT! +${payout.toLocaleString()} coins · Beat ${beatPct}% of players`,
          type: 'win',
        };
      }
      return { ...bet, resolved: true, payout, profit: payout - bet.amount, legendary: isLegendary };
    } else {
      streak = 0;
      profit -= bet.amount;
      lastToast = {
        message: `Missed it! −${bet.amount.toLocaleString()} coins on "${market.title.substring(0, 32)}…"`,
        type: 'loss',
      };
      return { ...bet, resolved: true, payout: 0, profit: -bet.amount };
    }
  });

  const updatedMarkets = state.markets.map(m => {
    const r = toResolve.find(tr => tr.id === m.id);
    if (!r) return m;
    return {
      ...m,
      status: 'resolved' as const,
      outcome: m.predeterminedOutcome,
      resolvedAt: now,
    };
  });

  return {
    ...state,
    markets: updatedMarkets,
    bets: updatedBets,
    user: state.user ? {
      ...state.user,
      coins: Math.round(coins),
      correctPredictions: correct,
      totalPredictions: total,
      totalProfit: Math.round(profit),
      streak,
      bestStreak: best,
    } : null,
    toast: lastToast ?? state.toast,
  };
}

// ── Reducer ───────────────────────────────────────────────────────────────────

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'INIT_USER': {
      const today = getTodayString();
      const user: User = {
        username: action.username.trim() || 'Trader',
        coins: 1_000,
        streak: 0,
        bestStreak: 0,
        lastActiveDate: today,
        lastDailyBonusDate: today,
        correctPredictions: 0,
        totalPredictions: 0,
        totalProfit: 0,
      };
      return { ...state, user, showUsernameModal: false, showDailyBonus: true, dailyBonusAmount: 50 };
    }

    case 'CHECK_DAILY_BONUS': {
      if (!state.user) return state;
      const today = getTodayString();
      if (state.user.lastDailyBonusDate === today) return state;
      return { ...state, showDailyBonus: true, dailyBonusAmount: calculateDailyBonus(state.user.streak) };
    }

    case 'CLAIM_DAILY_BONUS': {
      if (!state.user) return state;
      const bonus = state.dailyBonusAmount;
      return {
        ...state,
        user: { ...state.user, coins: state.user.coins + bonus, lastDailyBonusDate: getTodayString(), lastActiveDate: getTodayString() },
        showDailyBonus: false,
        toast: { message: `Daily bonus! +${bonus} coins claimed!`, type: 'bonus' },
      };
    }

    case 'DISMISS_DAILY_BONUS':
      return { ...state, showDailyBonus: false };

    case 'PLACE_BET': {
      if (!state.user) return state;
      const { marketId, side, amount, optionIdx, confidence = 'normal' } = action;
      const market = state.markets.find(m => m.id === marketId);
      if (!market || market.status !== 'open' || market.closeTime <= Date.now()) return state;
      const effectiveAmount = Math.max(1, Math.round(amount * CONFIDENCE_MULT[confidence]));
      if (amount <= 0 || effectiveAmount > state.user.coins) return state;

      const isMCQ = (market.type === 'mcq' || market.type === 'range') && optionIdx !== undefined;

      let prob: number;
      let updatedMarkets: Market[];
      let optionLabel: string | undefined;

      if (isMCQ) {
        prob = getOptionProb(market, optionIdx!);
        optionLabel = market.options?.[optionIdx!];
        const newPools = [...(market.optionPools ?? [])];
        newPools[optionIdx!] = (newPools[optionIdx!] ?? 0) + effectiveAmount;
        updatedMarkets = state.markets.map(m =>
          m.id !== marketId ? m : { ...m, optionPools: newPools }
        );
      } else {
        prob = side === 'yes' ? getYesProb(market) : getNoProb(market);
        updatedMarkets = state.markets.map(m =>
          m.id !== marketId ? m : {
            ...m,
            yesPool: side === 'yes' ? m.yesPool + effectiveAmount : m.yesPool,
            noPool:  side === 'no'  ? m.noPool  + effectiveAmount : m.noPool,
          }
        );
      }

      const newBet: Bet = {
        id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        marketId,
        marketTitle: market.title,
        side,
        optionIdx,
        optionLabel,
        amount: effectiveAmount,
        confidence,
        timestamp: Date.now(),
        probAtBet: prob,
        payout: null,
        profit: null,
        resolved: false,
      };

      const label = isMCQ ? (optionLabel ?? `Option ${(optionIdx ?? 0) + 1}`) : side.toUpperCase();
      const confLabel = confidence !== 'normal' ? ` (${CONFIDENCE_META[confidence].label})` : '';

      return {
        ...state,
        user: { ...state.user, coins: state.user.coins - effectiveAmount },
        markets: updatedMarkets,
        bets: [...state.bets, newBet],
        toast: { message: `Prediction locked! ${effectiveAmount.toLocaleString()} coins on ${label}${confLabel}`, type: 'info' },
      };
    }

    case 'RESOLVE_MARKETS':
      return resolveMarketsInState(state);

    case 'ADD_MARKETS': {
      const now = Date.now();
      const H   = 3_600_000;
      const MAX_OPEN = 20; // cap to keep the feed focused

      // Don't add more if already at capacity
      const currentOpen = state.markets.filter(m => m.status === 'open').length;
      const slotsAvailable = MAX_OPEN - currentOpen;
      if (slotsAvailable <= 0) return state;

      // Deduplicate: skip any draft whose title already exists among open markets
      const existingTitles = new Set(
        state.markets
          .filter(m => m.status === 'open')
          .map(m => m.title.trim().toLowerCase())
      );
      const dedupedDrafts = action.markets
        .filter(d => !existingTitles.has(d.title.trim().toLowerCase()))
        .slice(0, slotsAvailable); // respect the cap
      if (dedupedDrafts.length === 0) return state;

      const newMarkets: Market[] = dedupedDrafts.map((m, i) => {
        const mtype: MarketType = m.type ?? 'binary';
        const base = {
          id:           `live_${now}_${i}_${Math.random().toString(36).substr(2, 4)}`,
          title:        m.title,
          description:  m.description,
          category:     m.category,
          type:         mtype,
          closeTime:    m.closeTime ?? now + (4 + i * 7) * H,
          status:       'open' as const,
          aiPrediction: m.aiPrediction,
          aiPredictedOption: m.aiPredictedOption,
          resolvedAt:   null,
        };
        if (mtype === 'binary') {
          return {
            ...base,
            yesPool: m.yesPool,
            noPool:  m.noPool,
            outcome: null,
            predeterminedOutcome: (Math.random() < m.aiPrediction ? 'yes' : 'no') as 'yes' | 'no',
          };
        } else {
          const optCount = m.options?.length ?? 4;
          return {
            ...base,
            yesPool: 0,
            noPool:  0,
            outcome: null,
            predeterminedOutcome: 'yes' as const, // unused for MCQ
            options:              m.options ?? [],
            optionPools:          m.optionPools ?? m.options?.map(() => Math.floor(Math.random() * 4000) + 2000) ?? [],
            predeterminedOptionIdx: m.aiPredictedOption !== undefined
              ? (Math.random() < 0.6 ? m.aiPredictedOption : Math.floor(Math.random() * optCount))
              : Math.floor(Math.random() * optCount),
          };
        }
      });
      return { ...state, markets: [...state.markets, ...newMarkets] };
    }

    case 'NAVIGATE':
      return { ...state, view: action.view, selectedMarketId: action.marketId ?? null };

    case 'DISMISS_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}
