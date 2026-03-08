import type { Bet, Market } from './types';

// ── Per-topic notification copy ───────────────────────────────────────────────

const TOPIC_NOTIF: Record<string, { emoji: string; messages: string[] }> = {
  sports: {
    emoji: '⚽',
    messages: [
      'New sports predictions are live — can you call it? 🏆',
      'Fresh sports markets just dropped. Put your money where your mouth is!',
      'Your sports instincts are needed. New picks are up!',
    ],
  },
  finance: {
    emoji: '📈',
    messages: [
      'New finance markets just dropped — what\'s your take? 💰',
      'Markets are moving! Fresh finance predictions await.',
      'New economic predictions are live. Are you sharp enough?',
    ],
  },
  entertainment: {
    emoji: '🎬',
    messages: [
      'Hot new entertainment predictions — are you right? 🎬',
      'Fresh celebrity & film markets just dropped!',
      'New entertainment picks are live — show your knowledge!',
    ],
  },
  weather: {
    emoji: '🌤',
    messages: [
      'New weather predictions — test your forecast skills! 🌤',
      'Fresh weather markets are up — what\'s your call?',
    ],
  },
  platform: {
    emoji: '🌍',
    messages: [
      'New world & tech predictions are live — weigh in! 🌍',
      'Fresh global predictions just dropped. Make your call!',
    ],
  },
};

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

// ── Topic detection ───────────────────────────────────────────────────────────

/** Returns the categories where the user has at least one unresolved bet */
export function getActiveTopics(bets: Bet[], markets: Market[]): string[] {
  const activeBetMarketIds = new Set(
    bets.filter(b => !b.resolved).map(b => b.marketId)
  );
  const categories = new Set<string>();
  for (const m of markets) {
    if (activeBetMarketIds.has(m.id)) categories.add(m.category);
  }
  return Array.from(categories);
}

/** Returns a market the user has an active bet on that closes within 2 hours */
export function getUrgentBet(bets: Bet[], markets: Market[]): { title: string; timeLeft: string } | null {
  const now = Date.now();
  const twoHours = 2 * 3_600_000;
  const activeIds = new Set(bets.filter(b => !b.resolved).map(b => b.marketId));
  const urgent = markets.find(
    m =>
      m.status === 'open' &&
      activeIds.has(m.id) &&
      m.closeTime - now > 0 &&
      m.closeTime - now < twoHours
  );
  if (!urgent) return null;
  const diff = urgent.closeTime - now;
  const h = Math.floor(diff / 3_600_000);
  const min = Math.floor((diff % 3_600_000) / 60_000);
  return {
    title: urgent.title.length > 42 ? urgent.title.slice(0, 39) + '…' : urgent.title,
    timeLeft: h > 0 ? `${h}h ${min}m` : `${min}m`,
  };
}

// ── Notification sender ───────────────────────────────────────────────────────

export function sendTopicNotification(
  topics: string[],
  bets: Bet[],
  markets: Market[]
): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  // Priority 1: a bet is closing soon
  const urgent = getUrgentBet(bets, markets);
  if (urgent) {
    new Notification('ToldYa — Bet Closing Soon! ⏰', {
      body: `"${urgent.title}" closes in ${urgent.timeLeft}. Fingers crossed! 🤞`,
      icon: '/icons/icon-192.png',
      tag: 'toldya-urgent',
    });
    return;
  }

  // Priority 2: topic-specific message based on active bets
  if (topics.length > 0) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const data = TOPIC_NOTIF[topic] ?? TOPIC_NOTIF['platform'];
    const body = data.messages[Math.floor(Math.random() * data.messages.length)];
    new Notification(`ToldYa ${data.emoji}`, {
      body,
      icon: '/icons/icon-192.png',
      tag: `toldya-${topic}`,
    });
    return;
  }

  // Fallback: no active bets yet
  new Notification('ToldYa 👑 — New Predictions Live!', {
    body: 'Fresh markets just dropped. Make your call and prove you called it!',
    icon: '/icons/icon-192.png',
    tag: 'toldya-generic',
  });
}
