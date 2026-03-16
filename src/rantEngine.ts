import type { GameState, Action, Rant, RantCategory } from './types';
import { BOT_RANTS, createInitialBattles } from './rantData';

// ── Helpers ────────────────────────────────────────────────────────────────

const TITLE_BANK: Record<RantCategory, string[]> = {
  all:           ['My Honest Rant About Everything', 'Unpopular Opinion — Listen Up'],
  work:          ['My Boss Does This Every Single Week', 'Corporate Culture Is Completely Broken', 'Why Do Meetings Exist at This Point', 'Open Plan Offices Are a Scam'],
  life:          ['Modern Life Problems Nobody Talks About', 'Small Things That Slowly Break You', 'Society Needs to Fix This Immediately'],
  tech:          ['Tech Fails That Ruin My Entire Day', 'Why Is This App Still Broken in 2024', 'Software That Actively Gaslights Users'],
  politics:      ['Nobody Asked But I Have Thoughts', 'The System Is Rigged and Here Is Proof', 'Why Is This Still How Things Work'],
  sports:        ['My Team Deserved Far Better Than This', 'Sports Refs Are Actually Blind', 'Fantasy Sports Was a Mistake'],
  relationships: ['Red Flags Everyone Pretends Are Normal', 'Communication Really Is Not That Hard', 'Why Do People Do This'],
};

export function generateAITitle(category: RantCategory): string {
  const pool = TITLE_BANK[category] ?? TITLE_BANK['all'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getReputation(rantsPosted: number): string {
  if (rantsPosted >= 50) return 'Legendary';
  if (rantsPosted >= 25) return 'Professional';
  if (rantsPosted >= 15) return 'Seasoned';
  if (rantsPosted >= 8)  return 'Rising';
  if (rantsPosted >= 3)  return 'Rookie';
  return 'Fresh Ranter';
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'm';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

export function haptic(type: 'light' | 'medium' | 'heavy') {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 25 : 50);
  }
}

// ── Initial state ──────────────────────────────────────────────────────────

export function createInitialState(): GameState {
  return {
    user: null,
    rants: [...BOT_RANTS],
    battles: createInitialBattles(),
    view: 'feed',
    filter: 'all',
    toast: null,
    showUsernameModal: true,
    userReactions: {},
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {

    case 'INIT_USER': {
      const user = {
        username: action.username,
        rantsPosted: 0,
        reactionsReceived: 0,
        battlesWon: 0,
        totalVotesReceived: 0,
      };
      return { ...state, user, showUsernameModal: false };
    }

    case 'PLACE_REACTION': {
      const { rantId, reaction } = action;
      const current = state.userReactions[rantId] ?? [];
      const isOn = current.includes(reaction);

      const newReactions = isOn
        ? current.filter(r => r !== reaction)
        : [...current, reaction];

      const rants = state.rants.map(r => {
        if (r.id !== rantId) return r;
        return {
          ...r,
          reactions: {
            ...r.reactions,
            [reaction]: r.reactions[reaction] + (isOn ? -1 : 1),
          },
        };
      });

      // credit the author if it's the player's own rant
      const targetRant = state.rants.find(r => r.id === rantId);
      let user = state.user;
      if (user && targetRant && targetRant.author === user.username && !isOn) {
        user = { ...user, reactionsReceived: user.reactionsReceived + 1 };
      }

      return {
        ...state,
        rants,
        user,
        userReactions: { ...state.userReactions, [rantId]: newReactions },
      };
    }

    case 'POST_RANT': {
      const newRant: Rant = {
        ...action.rant,
        id: `user_${Date.now()}`,
        timestamp: Date.now(),
        reactions: { relatable: 0, funny: 0, problem: 0, accurate: 0 },
        isBot: false,
      };
      const user = state.user
        ? { ...state.user, rantsPosted: state.user.rantsPosted + 1 }
        : state.user;
      return {
        ...state,
        rants: [newRant, ...state.rants],
        user,
        view: 'feed',
        toast: { message: 'Rant posted! 🔥', type: 'fire' },
      };
    }

    case 'VOTE_BATTLE': {
      const battles = state.battles.map(b => {
        if (b.id !== action.battleId) return b;
        if (b.userVote !== null) return b; // already voted
        const update = action.side === 'a'
          ? { votesA: b.votesA + 1, userVote: 'a' as const }
          : { votesB: b.votesB + 1, userVote: 'b' as const };
        return { ...b, ...update };
      });

      const battle = battles.find(b => b.id === action.battleId);
      const user = state.user && battle
        ? { ...state.user, totalVotesReceived: state.user.totalVotesReceived + 1 }
        : state.user;

      return {
        ...state,
        battles,
        user,
        toast: { message: 'Vote cast! ⚡', type: 'success' },
      };
    }

    case 'NAVIGATE':
      return { ...state, view: action.view };

    case 'SET_FILTER':
      return { ...state, filter: action.filter };

    case 'DISMISS_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}
