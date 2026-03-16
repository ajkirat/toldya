import type { Rant, RantBattle } from './types';

const NOW = Date.now();
const H = 3_600_000;
const D = 86_400_000;

export const BOT_RANTS: Rant[] = [
  // ── WORK ───────────────────────────────────────────────────────────────
  {
    id: 'b1', author: 'WorkdayWarrior', isBot: true, voiceEffect: 'm1',
    title: 'My Boss Schedules 9am Meetings Every Monday Like It\'s Normal',
    duration: 13, category: 'work', timestamp: NOW - 2 * H,
    reactions: { relatable: 1247, funny: 312, problem: 589, accurate: 834 },
  },
  {
    id: 'b2', author: 'OfficeChronicles', isBot: true, voiceEffect: 'f1',
    title: 'Open Plan Offices Are a Productivity Destroyer and Nobody Will Admit It',
    duration: 11, category: 'work', timestamp: NOW - 5 * H,
    reactions: { relatable: 934, funny: 201, problem: 712, accurate: 623 },
  },
  {
    id: 'b3', author: 'SlackSurvivor', isBot: true, voiceEffect: 'm2',
    title: '25 Slack Notifications for a Meeting That Could Have Been a Three-Word Email',
    duration: 14, category: 'work', timestamp: NOW - 1 * D,
    reactions: { relatable: 2103, funny: 891, problem: 456, accurate: 1102 },
  },
  {
    id: 'b4', author: 'ZoomZombie', isBot: true, voiceEffect: 'f2',
    title: 'Back-to-Back Video Calls Are Slowly Draining My Soul and IQ',
    duration: 10, category: 'work', timestamp: NOW - 1.5 * D,
    reactions: { relatable: 1876, funny: 543, problem: 789, accurate: 967 },
  },
  {
    id: 'b5', author: 'CorporateCassandra', isBot: true, voiceEffect: 'm3',
    title: 'They Called My Raise Request Out of Band While Buying New Ping-Pong Tables',
    duration: 12, category: 'work', timestamp: NOW - 2 * D,
    reactions: { relatable: 1654, funny: 402, problem: 1023, accurate: 789 },
  },
  {
    id: 'b6', author: 'DeadlineDevil', isBot: true, voiceEffect: 'f3',
    title: 'Stop Marking Everything Urgent and High Priority — Nothing Is Then',
    duration: 9, category: 'work', timestamp: NOW - 3 * D,
    reactions: { relatable: 2312, funny: 678, problem: 834, accurate: 1456 },
  },

  // ── LIFE ───────────────────────────────────────────────────────────────
  {
    id: 'b7', author: 'MorningMisanthrope', isBot: true, voiceEffect: 'm1',
    title: 'My Neighbor Mows Grass at 7am Every Saturday Without Fail or Guilt',
    duration: 11, category: 'life', timestamp: NOW - 3 * H,
    reactions: { relatable: 1089, funny: 734, problem: 312, accurate: 678 },
  },
  {
    id: 'b8', author: 'GroceryGrievances', isBot: true, voiceEffect: 'f1',
    title: 'The Self-Checkout Machine Accused Me of Theft for the Fourth Time This Month',
    duration: 13, category: 'life', timestamp: NOW - 6 * H,
    reactions: { relatable: 2567, funny: 1203, problem: 345, accurate: 1789 },
  },
  {
    id: 'b9', author: 'TrafficTyrant', isBot: true, voiceEffect: 'm2',
    title: 'Nobody Knows How to Merge on the Highway and It Is Ruining Civilization',
    duration: 10, category: 'life', timestamp: NOW - 4 * D,
    reactions: { relatable: 3102, funny: 987, problem: 723, accurate: 2145 },
  },
  {
    id: 'b10', author: 'SubscriptionSlave', isBot: true, voiceEffect: 'f2',
    title: 'I Pay for 11 Streaming Services and Still Find Nothing to Watch on Friday Night',
    duration: 12, category: 'life', timestamp: NOW - 5 * D,
    reactions: { relatable: 4231, funny: 2301, problem: 567, accurate: 3012 },
  },

  // ── TECH ───────────────────────────────────────────────────────────────
  {
    id: 'b11', author: 'DebugDespair', isBot: true, voiceEffect: 'm3',
    title: 'My Code Worked Yesterday Perfectly and Now It Doesn\'t for Absolutely No Reason',
    duration: 14, category: 'tech', timestamp: NOW - 4 * H,
    reactions: { relatable: 3456, funny: 1678, problem: 2103, accurate: 2890 },
  },
  {
    id: 'b12', author: 'UpdateUproar', isBot: true, voiceEffect: 'f3',
    title: 'Windows Chose to Update Itself During My Live Client Presentation Today',
    duration: 11, category: 'tech', timestamp: NOW - 2 * D,
    reactions: { relatable: 4102, funny: 2456, problem: 1234, accurate: 3678 },
  },
  {
    id: 'b13', author: 'PasswordPurgatory', isBot: true, voiceEffect: 'm1',
    title: 'Websites That Reject My Password for Being Too Long and Too Secure Need to Explain Themselves',
    duration: 13, category: 'tech', timestamp: NOW - 3 * D,
    reactions: { relatable: 2876, funny: 1456, problem: 2012, accurate: 2234 },
  },

  // ── POLITICS ───────────────────────────────────────────────────────────
  {
    id: 'b14', author: 'NewsCycleNausea', isBot: true, voiceEffect: 'f1',
    title: 'Breaking News Alert Every Single Hour for the Exact Same Non-Story Since Tuesday',
    duration: 10, category: 'politics', timestamp: NOW - 6 * H,
    reactions: { relatable: 1923, funny: 876, problem: 1456, accurate: 1234 },
  },
  {
    id: 'b15', author: 'FormFillerFury', isBot: true, voiceEffect: 'm2',
    title: 'Government Forms That Ask the Same Question 17 Different Times in 17 Different Ways',
    duration: 12, category: 'politics', timestamp: NOW - 4 * D,
    reactions: { relatable: 3789, funny: 1902, problem: 2345, accurate: 3102 },
  },

  // ── SPORTS ─────────────────────────────────────────────────────────────
  {
    id: 'b16', author: 'RefRoaster', isBot: true, voiceEffect: 'f2',
    title: 'The Referee Was Clearly Paid to Be Against Us the Entire Game and Nobody Agrees',
    duration: 11, category: 'sports', timestamp: NOW - 7 * H,
    reactions: { relatable: 1678, funny: 934, problem: 512, accurate: 1203 },
  },
  {
    id: 'b17', author: 'FantasyFailure', isBot: true, voiceEffect: 'm3',
    title: 'My Fantasy Team Captain Scores Zero Points Every Single Crucial Week Without Fail',
    duration: 9, category: 'sports', timestamp: NOW - 3 * D,
    reactions: { relatable: 2103, funny: 1567, problem: 678, accurate: 1789 },
  },
  {
    id: 'b18', author: 'CoachCritic', isBot: true, voiceEffect: 'f3',
    title: 'Why Did He Sub Off Our Best Player in the 80th Minute When We Were Winning',
    duration: 13, category: 'sports', timestamp: NOW - 5 * D,
    reactions: { relatable: 1456, funny: 678, problem: 934, accurate: 1102 },
  },

  // ── RELATIONSHIPS ──────────────────────────────────────────────────────
  {
    id: 'b19', author: 'DryTexterDetector', isBot: true, voiceEffect: 'm1',
    title: 'People Who Reply K to a Three-Paragraph Heartfelt Message Need to Explain Themselves',
    duration: 10, category: 'relationships', timestamp: NOW - 8 * H,
    reactions: { relatable: 3912, funny: 2103, problem: 1234, accurate: 3456 },
  },
  {
    id: 'b20', author: 'GhostingGuru', isBot: true, voiceEffect: 'f1',
    title: 'They Viewed My Story Right After Reading My Text and Still Have Not Replied in 3 Days',
    duration: 12, category: 'relationships', timestamp: NOW - 2 * D,
    reactions: { relatable: 4567, funny: 2891, problem: 1678, accurate: 4102 },
  },
  {
    id: 'b21', author: 'SplitBillSaga', isBot: true, voiceEffect: 'm2',
    title: 'The Friend Who Always Forgets Their Wallet at Dinner Every Single Time We Go Out',
    duration: 11, category: 'relationships', timestamp: NOW - 3 * D,
    reactions: { relatable: 3234, funny: 2456, problem: 1789, accurate: 2678 },
  },
  {
    id: 'b22', author: 'VaguebookVictim', isBot: true, voiceEffect: 'f2',
    title: 'Friends Who Post Some People Need to Grow Up Without Any Context or Explanation',
    duration: 9, category: 'relationships', timestamp: NOW - 4 * D,
    reactions: { relatable: 2789, funny: 1934, problem: 1023, accurate: 2345 },
  },
];

export const BOT_LEADERBOARD = [
  { username: 'GhostingGuru',       rantsPosted: 58, reactionsReceived: 49_823, battlesWon: 41 },
  { username: 'SubscriptionSlave',  rantsPosted: 52, reactionsReceived: 44_210, battlesWon: 38 },
  { username: 'UpdateUproar',       rantsPosted: 49, reactionsReceived: 41_567, battlesWon: 35 },
  { username: 'DryTexterDetector',  rantsPosted: 47, reactionsReceived: 39_102, battlesWon: 33 },
  { username: 'TrafficTyrant',      rantsPosted: 44, reactionsReceived: 36_890, battlesWon: 31 },
  { username: 'DebugDespair',       rantsPosted: 41, reactionsReceived: 34_234, battlesWon: 28 },
  { username: 'FormFillerFury',     rantsPosted: 38, reactionsReceived: 31_789, battlesWon: 26 },
  { username: 'SplitBillSaga',      rantsPosted: 36, reactionsReceived: 29_456, battlesWon: 24 },
  { username: 'WorkdayWarrior',     rantsPosted: 34, reactionsReceived: 27_103, battlesWon: 22 },
  { username: 'VaguebookVictim',    rantsPosted: 31, reactionsReceived: 24_678, battlesWon: 20 },
  { username: 'SlackSurvivor',      rantsPosted: 28, reactionsReceived: 22_345, battlesWon: 18 },
  { username: 'GroceryGrievances',  rantsPosted: 26, reactionsReceived: 20_123, battlesWon: 16 },
  { username: 'PasswordPurgatory',  rantsPosted: 23, reactionsReceived: 17_890, battlesWon: 14 },
  { username: 'ZoomZombie',         rantsPosted: 21, reactionsReceived: 15_567, battlesWon: 12 },
  { username: 'RefRoaster',         rantsPosted: 18, reactionsReceived: 13_234, battlesWon: 10 },
];

export const DAILY_PROMPTS = [
  'Sunday: What ruins a perfectly good weekend?',
  'Monday Blues: What makes Mondays unbearable?',
  'Tuesday: The most underrated mid-week frustration?',
  'Wednesday Meltdown: What tipped you over today?',
  'Thursday: Almost Friday — what is still going wrong?',
  'Friday Feelings: What dares ruin the Friday vibe?',
  'Saturday: How did the weekend get ruined already?',
];

export function createInitialBattles(): RantBattle[] {
  return [
    { id: 'battle1', rantAId: 'b1',  rantBId: 'b7',  votesA: 312, votesB: 245, userVote: null },
    { id: 'battle2', rantAId: 'b11', rantBId: 'b12', votesA: 489, votesB: 356, userVote: null },
    { id: 'battle3', rantAId: 'b19', rantBId: 'b20', votesA: 267, votesB: 389, userVote: null },
    { id: 'battle4', rantAId: 'b16', rantBId: 'b17', votesA: 534, votesB: 412, userVote: null },
    { id: 'battle5', rantAId: 'b5',  rantBId: 'b15', votesA: 223, votesB: 278, userVote: null },
  ];
}
