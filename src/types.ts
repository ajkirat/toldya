export type VoiceEffect = 'none' | 'm1' | 'm2' | 'm3' | 'f1' | 'f2' | 'f3';
export type ReactionKey = 'relatable' | 'funny' | 'problem' | 'accurate';
export type View = 'feed' | 'record' | 'battles' | 'leaderboard' | 'profile';
export type RantCategory = 'all' | 'work' | 'life' | 'tech' | 'politics' | 'sports' | 'relationships';

export interface Rant {
  id: string;
  author: string;
  title: string;
  audioBase64?: string;   // undefined for bot rants
  duration: number;       // seconds
  category: RantCategory;
  timestamp: number;      // unix ms
  reactions: Record<ReactionKey, number>;
  voiceEffect: VoiceEffect;
  isBot: boolean;
}

export interface User {
  username: string;
  rantsPosted: number;
  reactionsReceived: number;
  battlesWon: number;
  totalVotesReceived: number;
}

export interface RantBattle {
  id: string;
  rantAId: string;
  rantBId: string;
  votesA: number;
  votesB: number;
  userVote: 'a' | 'b' | null;
}

export interface Toast {
  message: string;
  type: 'success' | 'info' | 'fire';
}

export interface GameState {
  user: User | null;
  rants: Rant[];
  battles: RantBattle[];
  view: View;
  filter: RantCategory;
  toast: Toast | null;
  showUsernameModal: boolean;
  userReactions: Record<string, ReactionKey[]>; // rantId → reactions user has toggled on
}

export type Action =
  | { type: 'INIT_USER'; username: string }
  | { type: 'PLACE_REACTION'; rantId: string; reaction: ReactionKey }
  | { type: 'POST_RANT'; rant: Omit<Rant, 'id' | 'timestamp' | 'reactions' | 'isBot'> }
  | { type: 'VOTE_BATTLE'; battleId: string; side: 'a' | 'b' }
  | { type: 'NAVIGATE'; view: View }
  | { type: 'SET_FILTER'; filter: RantCategory }
  | { type: 'DISMISS_TOAST' };
