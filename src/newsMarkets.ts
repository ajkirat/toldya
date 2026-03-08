import type { MarketDraft } from './gameEngine';
import type { Market } from './types';

const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

const FEEDS: { url: string; category: Market['category'] }[] = [
  // ── Cricket & Sports (India-first) ────────────────────────────────────────
  { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml',                   category: 'sports' },
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',        category: 'sports' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms',          category: 'sports' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',                  category: 'sports' },
  { url: 'https://www.crictracker.com/feed/',                                 category: 'sports' },

  // ── Finance (India + Global) ──────────────────────────────────────────────
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'finance' },
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms',          category: 'finance' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                   category: 'finance' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',                   category: 'finance' },

  // ── Entertainment & Bollywood ─────────────────────────────────────────────
  { url: 'https://www.bollywoodhungama.com/feed/',                            category: 'entertainment' },
  { url: 'https://www.koimoi.com/feed/',                                      category: 'entertainment' },
  { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',     category: 'entertainment' },

  // ── World & India General ─────────────────────────────────────────────────
  { url: 'https://feeds.feedburner.com/NdtvNews-TopStories',                  category: 'platform' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss',         category: 'platform' },
  { url: 'https://timesofindia.indiatimes.com/rssfeedsdefault.cms',           category: 'platform' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                      category: 'platform' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                        category: 'platform' },
];

interface RSSItem { title: string; description: string }
interface RSSResponse { status: string; items?: RSSItem[] }

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
    description: 'With new regulations in 2026, the field is closer than ever. Verstappen, Norris and Hamilton are the frontrunners.',
    category: 'sports', type: 'mcq',
    options: ['Max Verstappen', 'Lando Norris', 'Lewis Hamilton', 'Charles Leclerc'],
    optionPools: [9100, 7300, 5800, 4200],
    aiPredictedOption: 0, aiPrediction: 0.35,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Champions League 2025-26 winner?',
    description: 'Quarter-finals stage. Real Madrid, Manchester City, Arsenal and PSG remain strong contenders for the title.',
    category: 'sports', type: 'mcq',
    options: ['Real Madrid', 'Manchester City', 'Arsenal', 'PSG'],
    optionPools: [10200, 8100, 6400, 5300],
    aiPredictedOption: 0, aiPrediction: 0.33,
    yesPool: 0, noPool: 0,
  },
  // Finance range
  {
    title: 'Where does Bitcoin close this week?',
    description: 'BTC has been volatile amid macro uncertainty. Institutional ETF flows remain strong but sentiment is mixed.',
    category: 'finance', type: 'range',
    options: ['Below $75,000', '$75k – $85k', '$85k – $95k', 'Above $95,000'],
    optionPools: [4100, 7200, 6300, 3800],
    aiPredictedOption: 1, aiPrediction: 0.45,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Nifty 50 weekly return this week?',
    description: 'Markets are reacting to RBI policy signals and global cues. FII activity has been mixed over the past fortnight.',
    category: 'finance', type: 'range',
    options: ['Down >2%', 'Flat (±2%)', 'Up 2%–5%', 'Up >5%'],
    optionPools: [3200, 6100, 5400, 2800],
    aiPredictedOption: 1, aiPrediction: 0.4,
    yesPool: 0, noPool: 0,
  },
  // Entertainment
  {
    title: 'Which film tops the Indian box office this weekend?',
    description: 'Three major releases are competing this weekend. Salman Khan\'s action film faces off against a Tollywood blockbuster and a Hollywood tentpole.',
    category: 'entertainment', type: 'mcq',
    options: ['Salman Khan\'s Action film', 'Allu Arjun\'s new release', 'Hollywood blockbuster', 'Indie surprise hit'],
    optionPools: [7100, 8400, 4200, 1800],
    aiPredictedOption: 1, aiPrediction: 0.39,
    yesPool: 0, noPool: 0,
  },
  {
    title: 'Oscar Best Picture 2027 frontrunner?',
    description: 'Awards season is heating up. Films from Villeneuve, Nolan and Scorsese are generating early buzz for the 2027 ceremony.',
    category: 'entertainment', type: 'mcq',
    options: ['Denis Villeneuve\'s new film', 'Christopher Nolan\'s project', 'Martin Scorsese\'s drama', 'A24 dark horse'],
    optionPools: [6200, 7100, 5400, 3800],
    aiPredictedOption: 1, aiPrediction: 0.36,
    yesPool: 0, noPool: 0,
  },
  // Platform / politics
  {
    title: 'Which country wins the most gold at the 2026 Asian Games?',
    description: 'The 2026 Asian Games take place in Nagoya, Japan. China, Japan, South Korea and India are all expected to compete strongly.',
    category: 'platform', type: 'mcq',
    options: ['China', 'Japan', 'South Korea', 'India'],
    optionPools: [12400, 7100, 5900, 3200],
    aiPredictedOption: 0, aiPrediction: 0.43,
    yesPool: 0, noPool: 0,
  },
];

// ── RSS helpers ───────────────────────────────────────────────────────────────

function detectCategory(title: string, fallback: Market['category']): Market['category'] {
  const t = title.toLowerCase();
  if (/cricket|football|soccer|tennis|ipl|nba|nfl|f1|formula.?1|match|score|team|league|tournament|player|goal|wicket|odi|t20|test match|rohit|kohli|bumrah|virat|dhoni|messi|ronaldo|mbapp|federer|djokovic/i.test(t)) return 'sports';
  if (/stock|market|bitcoin|crypto|ethereum|btc|eth|economy|inflation|gdp|rupee|dollar|bank|invest|rate|shares?|nasdaq|sensex|nifty|rbi|sebi|ipo|fed|interest rate|oil price|gold price/i.test(t)) return 'finance';
  if (/rain|weather|temperature|climate|storm|flood|cyclone|celsius|fahrenheit|monsoon|drought/i.test(t)) return 'weather';
  if (/movie|film|actor|actress|oscar|bollywood|netflix|series|music|award|celebrity|box.?office|ott|release|trailer|srk|salman|deepika|ranveer|alia|ranbir|shah rukh|karan johar|tollywood|kollywood/i.test(t)) return 'entertainment';
  return fallback;
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

// Returns true only for headlines that can meaningfully become a YES/NO prediction
function isYesNoWorthy(raw: string): boolean {
  const h = raw.toLowerCase();

  // Skip open-ended question words that make non-YES/NO questions
  if (/\b(what does|what did|what will|what are|what is|how does|how did|how will|why is|why did|where does|when will|who is|who are)\b/.test(h)) return false;

  // Skip commentary / retrospective / listicle formats — not predictions
  if (/\b(ratings?|review|analysis|explainer?|explained|obituary|ranking|in pictures?|quiz|profile|watch|opinion|reacts?|verdict|round.?up|round up|recap|preview\s*–)\b/.test(h)) return false;

  // Skip headlines with "was X … or Y?" comparisons (past commentary, not predictions)
  if (/\bwas\b.{0,60}\b(or|more like|versus|vs\.?)\b/.test(h)) return false;

  // Skip truncated headlines ending with "w...?" or "...?"
  if (/\.\.\.\??$/.test(raw.trim())) return false;

  // Skip articles / analysis / explainer signifiers in the middle
  if (/\b(what next|what you need|everything you|guide to|fact.?check)\b/.test(h)) return false;

  return true;
}

// Returns a YES/NO question string, or null if the headline can't be turned into one
function headlineToQuestion(raw: string): string | null {
  const h = cleanText(raw);
  if (!h) return null;
  if (!isYesNoWorthy(h)) return null;

  // Already a question — but only keep if it's a binary-answerable one
  if (h.endsWith('?')) {
    const firstWord = h.split(/\s+/)[0].toLowerCase();
    // "Who/What/How/Why/Where/When" questions are open-ended → skip
    if (/^(who|what|how|why|where|when|which)$/i.test(firstWord)) return null;
    return h.slice(0, 88);
  }

  // "X to [verb]" pattern — short enough to form a natural question
  if (/\bto\s+[a-z]/i.test(h) && h.split(' ').length <= 11) {
    return (h.length > 84 ? h.slice(0, 81) + '...' : h) + '?';
  }

  // Verb swap patterns — turn the subject + verb into a "Will X [do Y]?" question
  const verbSwaps: [RegExp, string][] = [
    [/\b(wins?|beat[s]?|defeats?|clinches?)\b/i,           'win their next match?'],
    [/\b(rises?|gains?|surges?|jumps?|rallies?|soars?)\b/i, 'keep rising this week?'],
    [/\b(falls?|drops?|declines?|slumps?|crashes?)\b/i,    'drop further this week?'],
    [/\b(launches?|unveils?|announces?|reveals?)\b/i,      'deliver on this successfully?'],
    [/\b(signs?|passes?|approves?|backs?|endorses?)\b/i,   'push this through?'],
    [/\b(cuts?|reduces?|lowers?)\b/i,                      'cut further?'],
    [/\b(raises?|hikes?|increases?)\b/i,                   'raise rates further?'],
    [/\b(resigns?|quits?|steps? down)\b/i,                 'step down soon?'],
  ];

  const words = h.split(/\s+/);
  for (let i = 1; i < Math.min(words.length, 7); i++) {
    for (const [pattern, suffix] of verbSwaps) {
      if (pattern.test(words[i])) {
        const subject = words.slice(0, i).join(' ');
        if (subject.length < 3) continue; // skip single-char subjects
        return `Will ${subject} ${suffix}`;
      }
    }
  }

  // Last resort: headline is a straightforward statement — only use if it's short and clear
  // Skip if it looks like a statement that doesn't imply a future outcome
  const wordCount = words.length;
  if (wordCount < 4 || wordCount > 14) return null;

  const short = h.length > 84 ? h.slice(0, 81) + '...' : h;
  return short + '?';
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchNewsMarkets(): Promise<MarketDraft[]> {
  // Fetch RSS binary questions
  const results = await Promise.allSettled(
    FEEDS.map(feed =>
      fetch(`${RSS_PROXY}${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(8000) })
        .then(r => r.json() as Promise<RSSResponse>)
        .then(data => ({ items: (data.items ?? []).slice(0, 5), category: feed.category }))
    )
  );

  const binaryDrafts: MarketDraft[] = [];
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { items, category } = result.value;
    for (const item of items) {
      if (binaryDrafts.length >= 14) break;
      if (!item.title) continue;
      const question = headlineToQuestion(item.title);
      if (!question) continue; // skip headlines that don't form good YES/NO questions
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

  // Return binary first (fresh news), then MCQ/range
  return [...binaryDrafts, ...shuffled];
}
