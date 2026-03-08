import type { MarketDraft } from './gameEngine';
import type { Market } from './types';

// ── RSS proxy (allorigins = truly free, no rate limits) ───────────────────────
// Returns { contents: "<xml>" }
const PROXY = 'https://api.allorigins.win/get?url=';

// ── 25 feeds across India + World ─────────────────────────────────────────────
const FEEDS: { url: string; category: Market['category'] }[] = [
  // Cricket (India-first)
  { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml',                           category: 'sports' },
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',                category: 'sports' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms',                  category: 'sports' },
  { url: 'https://www.crictracker.com/feed/',                                          category: 'sports' },

  // Football / F1 / Global Sport
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',                          category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml',                          category: 'sports' },
  { url: 'https://feeds.skysports.com/skysports/football',                            category: 'sports' },

  // Indian Finance / Markets
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',      category: 'finance' },
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms',                  category: 'finance' },
  { url: 'https://www.moneycontrol.com/rss/latestnews.xml',                           category: 'finance' },
  { url: 'https://www.business-standard.com/rss/latest.rss',                          category: 'finance' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                            category: 'finance' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',                             category: 'finance' },

  // Bollywood & Entertainment
  { url: 'https://www.bollywoodhungama.com/feed/',                                    category: 'entertainment' },
  { url: 'https://www.koimoi.com/feed/',                                               category: 'entertainment' },
  { url: 'https://www.pinkvilla.com/feed',                                             category: 'entertainment' },
  { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',              category: 'entertainment' },

  // India News
  { url: 'https://feeds.feedburner.com/NdtvNews-TopStories',                           category: 'platform' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss',                  category: 'platform' },
  { url: 'https://timesofindia.indiatimes.com/rssfeedsdefault.cms',                    category: 'platform' },
  { url: 'https://indianexpress.com/feed/',                                             category: 'platform' },
  { url: 'https://www.indiatoday.in/rss/home',                                         category: 'platform' },
  { url: 'https://www.news18.com/rss/india.xml',                                       category: 'platform' },

  // World
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                               category: 'platform' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                                  category: 'platform' },
  { url: 'https://feeds.reuters.com/reuters/topNews',                                  category: 'platform' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface RSSItem { title: string; description: string }

// ── Parse raw RSS/Atom XML in the browser ─────────────────────────────────────
function parseXML(xml: string): RSSItem[] {
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item, entry'));
    return items.slice(0, 5).map(el => ({
      title: el.querySelector('title')?.textContent?.trim() ?? '',
      description: (
        el.querySelector('description')?.textContent ??
        el.querySelector('summary')?.textContent ??
        ''
      ).trim(),
    }));
  } catch {
    return [];
  }
}

// ── Fetch a single feed via allorigins ────────────────────────────────────────
async function fetchFeed(url: string): Promise<RSSItem[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`, {
    signal: AbortSignal.timeout(9000),
  });
  const json = await res.json() as { contents?: string };
  return parseXML(json.contents ?? '');
}

// ── Static MCQ / range templates with real current names ─────────────────────
const MCQ_TEMPLATES: MarketDraft[] = [
  // Sports
  {
    title: 'Who wins the IPL 2026 title?',
    description: 'IPL 2026 is underway. 10 franchises battle for the trophy. Mumbai Indians are the defending champions.',
    category: 'sports', type: 'mcq',
    options: ['Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bengaluru', 'Sunrisers Hyderabad'],
    optionPools: [8200, 6400, 5100, 4300],
    aiPredictedOption: 0, aiPrediction: 0.34,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'F1 2026 Drivers\' Championship winner?',
    description: 'New regulations in 2026 tighten the field. Verstappen, Norris and Hamilton are frontrunners.',
    category: 'sports', type: 'mcq',
    options: ['Max Verstappen', 'Lando Norris', 'Lewis Hamilton', 'Charles Leclerc'],
    optionPools: [9100, 7300, 5800, 4200],
    aiPredictedOption: 0, aiPrediction: 0.35,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Champions League 2025-26 winner?',
    description: 'Quarter-finals stage. Real Madrid, Manchester City, Arsenal and PSG remain strong contenders.',
    category: 'sports', type: 'mcq',
    options: ['Real Madrid', 'Manchester City', 'Arsenal', 'PSG'],
    optionPools: [10200, 8100, 6400, 5300],
    aiPredictedOption: 0, aiPrediction: 0.33,
    yesPool: 0, noPool: 0,
  },
  // Finance range
  {
    title: 'Where does Bitcoin close this week?',
    description: 'BTC volatile amid macro uncertainty. Institutional ETF flows remain strong but sentiment is mixed.',
    category: 'finance', type: 'range',
    options: ['Below $75,000', '$75k – $85k', '$85k – $95k', 'Above $95,000'],
    optionPools: [4100, 7200, 6300, 3800],
    aiPredictedOption: 1, aiPrediction: 0.45,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Nifty 50 weekly return this week?',
    description: 'Markets reacting to RBI policy signals and global cues. FII activity has been mixed.',
    category: 'finance', type: 'range',
    options: ['Down >2%', 'Flat (±2%)', 'Up 2%–5%', 'Up >5%'],
    optionPools: [3200, 6100, 5400, 2800],
    aiPredictedOption: 1, aiPrediction: 0.4,
    yesPool: 0, noPool: 0,
  },
  // Entertainment
  {
    title: 'Which film tops the Indian box office this weekend?',
    description: 'Three major releases competing this weekend — Bollywood, Tollywood and a Hollywood tentpole.',
    category: 'entertainment', type: 'mcq',
    options: ['Bollywood action release', 'Allu Arjun\'s new film', 'Hollywood blockbuster', 'Indie surprise'],
    optionPools: [7100, 8400, 4200, 1800],
    aiPredictedOption: 1, aiPrediction: 0.39,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Oscar Best Picture 2027 frontrunner?',
    description: 'Early awards season buzz. Films from Villeneuve, Nolan and Scorsese generating heat.',
    category: 'entertainment', type: 'mcq',
    options: ['Denis Villeneuve\'s new film', 'Christopher Nolan\'s project', 'Martin Scorsese\'s drama', 'A24 dark horse'],
    optionPools: [6200, 7100, 5400, 3800],
    aiPredictedOption: 1, aiPrediction: 0.36,
    yesPool: 0, noPool: 0,
  },
  // Platform
  {
    title: 'Which country wins the most gold at the 2026 Asian Games?',
    description: 'The 2026 Asian Games in Nagoya, Japan. China, Japan, South Korea and India all strong.',
    category: 'platform', type: 'mcq',
    options: ['China', 'Japan', 'South Korea', 'India'],
    optionPools: [12400, 7100, 5900, 3200],
    aiPredictedOption: 0, aiPrediction: 0.43,
    yesPool: 0, noPool: 0,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectCategory(title: string, fallback: Market['category']): Market['category'] {
  const t = title.toLowerCase();
  if (/cricket|ipl|t20|odi|test match|wicket|rohit|kohli|bumrah|virat|dhoni|football|soccer|tennis|nba|nfl|f1|formula.?1|match|score|league|tournament|goal|messi|ronaldo|federer|djokovic|wimbledon/i.test(t)) return 'sports';
  if (/stock|market|bitcoin|btc|ethereum|eth|crypto|economy|inflation|gdp|rupee|dollar|bank|invest|rate|shares?|nasdaq|sensex|nifty|rbi|sebi|ipo|fed|interest rate|oil price|gold price|moneycontrol|economic times/i.test(t)) return 'finance';
  if (/rain|weather|temperature|climate|storm|flood|cyclone|celsius|fahrenheit|monsoon|drought/i.test(t)) return 'weather';
  if (/movie|film|actor|actress|oscar|bollywood|netflix|series|music|award|celebrity|box.?office|ott|release|trailer|srk|salman|deepika|ranveer|alia|ranbir|shah rukh|karan johar|tollywood|kollywood|koimoi|pinkvilla/i.test(t)) return 'entertainment';
  return fallback;
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&#8230;/g, '…').replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

// Returns true only for headlines that can meaningfully become a YES/NO prediction
function isYesNoWorthy(raw: string): boolean {
  const h = raw.toLowerCase();
  if (/\b(what does|what did|what will|what are|what is|how does|how did|how will|why is|why did|where does|when will|who is|who are)\b/.test(h)) return false;
  if (/\b(ratings?|review|analysis|explainer?|explained|obituary|ranking|in pictures?|quiz|profile|watch|opinion|reacts?|verdict|round.?up|recap|preview\s*–)\b/.test(h)) return false;
  if (/\bwas\b.{0,60}\b(or|more like|versus|vs\.?)\b/.test(h)) return false;
  if (/\.\.\.\??$/.test(raw.trim())) return false;
  if (/\b(what next|what you need|everything you|guide to|fact.?check)\b/.test(h)) return false;
  return true;
}

// Verb normalization: match inflected form → infinitive for "Will X [verb] [rest]?"
const VERB_NORMS: [RegExp, string][] = [
  [/\b(beats?|defeats?|clinches?|triumphs?\s+over)\b/i,           'beat'],
  [/\b(wins?)\b/i,                                                 'win'],
  [/\b(rises?|gains?|surges?|jumps?|rallies?|soars?|climbs?)\b/i, 'rise'],
  [/\b(falls?|drops?|declines?|slumps?|crashes?|tumbles?)\b/i,   'fall'],
  [/\b(releases?|launches?|unveils?|announces?|reveals?)\b/i,     'release'],
  [/\b(crosses?|surpasses?|reaches?|hits?|achieves?)\b/i,         'cross'],
  [/\b(scores?)\b/i,                                              'score'],
  [/\b(signs?|passes?|approves?|backs?|endorses?)\b/i,            'pass'],
  [/\b(cuts?|reduces?|lowers?|slashes?)\b/i,                      'cut'],
  [/\b(raises?|hikes?|increases?|lifts?)\b/i,                     'raise'],
  [/\b(resigns?|quits?|steps?\s+down)\b/i,                        'resign'],
  [/\b(retains?|keeps?)\b/i,                                      'retain'],
  [/\b(breaks?)\b/i,                                              'break'],
  [/\b(returns?)\b/i,                                             'return'],
  [/\b(makes?|earns?|collects?)\b/i,                              'make'],
  [/\b(qualifies?|advances?|progresses?)\b/i,                     'qualify'],
];

// Build a specific YES/NO question from a headline, preserving proper nouns
function headlineToQuestion(raw: string): string | null {
  const h = cleanText(raw);
  if (!h || h.length < 12) return null;
  if (!isYesNoWorthy(h)) return null;

  // Already ends with "?" — keep only if binary-answerable
  if (h.endsWith('?')) {
    const first = h.split(/\s+/)[0].toLowerCase();
    if (/^(who|what|how|why|where|when|which)$/i.test(first)) return null;
    return h.length > 90 ? h.slice(0, 87) + '…?' : h;
  }

  // "X to [verb] ..." — already future-tense, just append "?"
  if (/\bto\s+[a-z]/i.test(h) && h.split(' ').length <= 12) {
    const q = h.length > 88 ? h.slice(0, 85) + '…' : h;
    return q + '?';
  }

  // Verb normalization — build "Will [exact subject] [infinitive] [exact rest]?"
  const words = h.split(/\s+/);
  for (let i = 1; i < Math.min(words.length, 9); i++) {
    for (const [pattern, infinitive] of VERB_NORMS) {
      if (pattern.test(words[i])) {
        const subject = words.slice(0, i).join(' ');
        if (subject.length < 3) continue;
        const afterVerb = words.slice(i + 1).join(' ');
        const question = afterVerb.length > 3
          ? `Will ${subject} ${infinitive} ${afterVerb}?`
          : `Will ${subject} ${infinitive}?`;
        return question.length > 95 ? question.slice(0, 92) + '…?' : question;
      }
    }
  }

  // Last resort: short, declarative headline used as-is
  const wc = words.length;
  if (wc < 5 || wc > 13) return null;
  const q = h.length > 88 ? h.slice(0, 85) + '…' : h;
  return q + '?';
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchNewsMarkets(): Promise<MarketDraft[]> {
  const results = await Promise.allSettled(
    FEEDS.map(feed =>
      fetchFeed(feed.url).then(items => ({ items, category: feed.category }))
    )
  );

  const binaryDrafts: MarketDraft[] = [];

  // Dedup within this batch (no two questions sharing 3+ significant words)
  const usedWordSets: Set<string>[] = [];
  function isTooSimilar(q: string): boolean {
    const sig = new Set(
      q.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 4)
    );
    for (const existing of usedWordSets) {
      let overlap = 0;
      for (const w of sig) if (existing.has(w)) overlap++;
      if (overlap >= 3) return true;
    }
    usedWordSets.push(sig);
    return false;
  }

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { items, category } = result.value;
    for (const item of items) {
      if (binaryDrafts.length >= 16) break;
      if (!item.title) continue;
      const question = headlineToQuestion(item.title);
      if (!question) continue;
      if (isTooSimilar(question)) continue;
      binaryDrafts.push({
        title:        question,
        description:  cleanText(item.description || item.title).slice(0, 180),
        category:     detectCategory(item.title, category),
        type:         'binary',
        yesPool:      Math.floor(Math.random() * 9_000) + 5_000,
        noPool:       Math.floor(Math.random() * 7_000) + 4_000,
        aiPrediction: parseFloat((0.30 + Math.random() * 0.40).toFixed(2)),
      });
    }
  }

  // Pick 3 random MCQ/range templates to mix in
  const shuffled = [...MCQ_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...binaryDrafts, ...shuffled];
}
