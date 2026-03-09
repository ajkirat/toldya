import type { MarketDraft } from './gameEngine';
import type { Market } from './types';

// ── RSS proxy (allorigins = truly free, no rate limits) ───────────────────────
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

// ── Static MCQ / range templates — all use REAL current names ────────────────
// Only include templates where options are stable facts (teams, drivers, countries).
// Never use generic placeholders.
const MCQ_TEMPLATES: MarketDraft[] = [
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

// Each verb maps to its own correct infinitive
const VERB_MAP: [RegExp, string][] = [
  // Sports / competition
  [/\bbeats?\b/i,           'beat'],
  [/\bwins?\b/i,            'win'],
  [/\bdefeats?\b/i,         'defeat'],
  [/\bclinches?\b/i,        'clinch'],
  [/\bsecures?\b/i,         'secure'],
  [/\bqualifies?\b/i,       'qualify'],
  [/\badvances?\b/i,        'advance'],
  [/\bleads?\b/i,           'lead'],
  [/\bclashes?\b/i,         'clash'],
  [/\bfaces?\b/i,           'face'],
  [/\bplays?\b/i,           'play'],
  [/\bmisses?\b/i,          'miss'],
  [/\bskips?\b/i,           'skip'],
  [/\bjoins?\b/i,           'join'],
  [/\bretains?\b/i,         'retain'],
  [/\bovertak(es?|en)\b/i,  'overtake'],
  // Scoring / achievement
  [/\bscores?\b/i,          'score'],
  [/\bhits?\b/i,            'hit'],
  [/\bcrosses?\b/i,         'cross'],
  [/\bsurpasses?\b/i,       'surpass'],
  [/\breaches?\b/i,         'reach'],
  [/\bachieves?\b/i,        'achieve'],
  [/\bbreaks?\b/i,          'break'],
  [/\bsets?\b/i,            'set'],
  // Financial movement — up
  [/\brises?\b/i,           'rise'],
  [/\bgains?\b/i,           'gain'],
  [/\bsurges?\b/i,          'surge'],
  [/\bjumps?\b/i,           'jump'],
  [/\bsoars?\b/i,           'soar'],
  [/\brallies?\b/i,         'rally'],
  [/\bclimbs?\b/i,          'climb'],
  [/\bbounces?\b/i,         'bounce'],
  [/\brecov(ers?)\b/i,      'recover'],
  // Financial movement — down
  [/\bfalls?\b/i,           'fall'],
  [/\bdrops?\b/i,           'drop'],
  [/\bdeclines?\b/i,        'decline'],
  [/\bslumps?\b/i,          'slump'],
  [/\bcrashes?\b/i,         'crash'],
  [/\btumbles?\b/i,         'tumble'],
  [/\bplunges?\b/i,         'plunge'],
  [/\btanks?\b/i,           'tank'],
  // Financial levels
  [/\bsettles?\b/i,         'settle'],
  [/\bcloses?\b/i,          'close'],
  [/\bopens?\b/i,           'open'],
  // Announcements / releases
  [/\blaunches?\b/i,        'launch'],
  [/\breleases?\b/i,        'release'],
  [/\bannounces?\b/i,       'announce'],
  [/\bunveils?\b/i,         'unveil'],
  [/\breveals?\b/i,         'reveal'],
  [/\bconfirms?\b/i,        'confirm'],
  [/\bpremieres?\b/i,       'premiere'],
  [/\bstreams?\b/i,         'stream'],
  // Legal / policy
  [/\bsigns?\b/i,           'sign'],
  [/\bapproves?\b/i,        'approve'],
  [/\bpasses?\b/i,          'pass'],
  [/\bendorses?\b/i,        'endorse'],
  [/\bextends?\b/i,         'extend'],
  [/\brenews?\b/i,          'renew'],
  [/\bfiles?\b/i,           'file'],
  [/\bsues?\b/i,            'sue'],
  [/\bmerges?\b/i,          'merge'],
  [/\bacquires?\b/i,        'acquire'],
  // Rate changes
  [/\bcuts?\b/i,            'cut'],
  [/\bslashes?\b/i,         'slash'],
  [/\braises?\b/i,          'raise'],
  [/\bhikes?\b/i,           'hike'],
  [/\bincreases?\b/i,       'increase'],
  // People / exits
  [/\bresigns?\b/i,         'resign'],
  [/\bquits?\b/i,           'quit'],
  [/\breturns?\b/i,         'return'],
  // Earnings / box office
  [/\bmakes?\b/i,           'make'],
  [/\bearns?\b/i,           'earn'],
  [/\bcollects?\b/i,        'collect'],
  // Misc
  [/\bgets?\b/i,            'get'],
  [/\btakes?\b/i,           'take'],
  [/\bholds?\b/i,           'hold'],
  [/\breceives?\b/i,        'receive'],
  [/\bcomes?\b/i,           'come'],
  [/\bgoes?\b/i,            'go'],
];

// Build a future-tense YES/NO question from a headline, preserving proper nouns.
// Returns null if the headline can't be cleanly converted.
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

  // "X to [verb] ..." — naturally future-tense
  if (/\bto\s+[a-z]/i.test(h) && h.split(' ').length <= 13) {
    const q = h.length > 90 ? h.slice(0, 87) + '…' : h;
    return q + '?';
  }

  // Verb-normalisation — "Will [exact subject] [infinitive] [exact rest]?"
  const words = h.split(/\s+/);
  for (let i = 1; i < Math.min(words.length, 10); i++) {
    for (const [pattern, infinitive] of VERB_MAP) {
      if (pattern.test(words[i])) {
        const subject = words.slice(0, i).join(' ');
        if (subject.length < 3) continue;
        const rest = words.slice(i + 1).join(' ');
        const question = rest.length > 3
          ? `Will ${subject} ${infinitive} ${rest}?`
          : `Will ${subject} ${infinitive}?`;
        return question.length > 98 ? question.slice(0, 95) + '…?' : question;
      }
    }
  }

  return null;
}

// ── Dynamic MCQ builder ───────────────────────────────────────────────────────
// Extract the proper-noun SUBJECT from a headline (the entity before the first verb).
// This gives us real names: "Pushpa 2", "Virat Kohli", "Reliance Industries", etc.
function extractSubjectEntity(headline: string): string | null {
  const h = cleanText(headline);
  if (!h) return null;
  const words = h.split(/\s+/);

  for (let i = 1; i < Math.min(words.length, 9); i++) {
    for (const [pattern] of VERB_MAP) {
      if (pattern.test(words[i])) {
        const candidate = words.slice(0, i).join(' ');
        if (
          /^[A-Z]/.test(candidate) &&          // must start with capital
          candidate.length >= 2 &&
          candidate.length <= 50 &&
          // filter bare articles / pronouns
          !/^(The|A|An|It|He|She|They|We|I|This|That|Its|His|Her|Their|Our)$/i.test(candidate) &&
          // filter pure numbers / currency strings
          !/^[\d₹$€£]/.test(candidate)
        ) {
          return candidate;
        }
        return null; // verb found but subject not usable
      }
    }
  }
  return null;
}

// Build a smart MCQ question whose options are real entities from the news
function buildDynamicMCQ(
  entities: string[],
  category: Market['category']
): MarketDraft | null {
  const opts = entities.slice(0, 4);
  if (opts.length < 3) return null;

  const joined = opts.join(' ').toLowerCase();

  // Detect entity type from known name patterns
  const isCricketer = /\b(sharma|kohli|rohit|virat|bumrah|dhoni|pandya|rahul|gill|jaiswal|pant|jadeja|siraj|ashwin|shami|hardik|yuzvendra|axar)\b/.test(joined);
  const isDriver = /\b(verstappen|norris|hamilton|leclerc|russell|sainz|alonso|perez|piastri)\b/.test(joined);
  const isSportsPerson = isCricketer || isDriver ||
    /\b(stokes|root|warner|cummins|babar|williamson|mbappe|haaland|salah|ronaldo|messi|djokovic|nadal|federer|serena)\b/.test(joined);

  const isIPLTeam = /\b(indians?|super kings?|challengers?|knight riders?|royals?|capitals?|titans?|giants?|sunrisers?)\b/.test(joined);
  const isFootballClub = /\b(madrid|arsenal|city|liverpool|chelsea|barcelona|juventus|milan|bayern|spurs|united|dortmund)\b/.test(joined);
  const isTeam = isIPLTeam || isFootballClub ||
    /\b(india|australia|england|pakistan|newzealand|southafrica|srilanka|bangladesh|westindies|zimbabwe)\b/.test(joined);

  const isStock = /\b(infosys|tcs|wipro|hcl|reliance|adani|tata|bajaj|icici|hdfc|sbi|mahindra|zomato|paytm|nykaa|ola|byju|flipkart)\b/.test(joined);
  const isCrypto = /\b(bitcoin|btc|ethereum|eth|solana|ripple|xrp|bnb|dogecoin)\b/.test(joined);

  let question: string;
  let description: string;

  if (category === 'sports') {
    if (isSportsPerson) {
      question = 'Who delivers the standout performance in sport this week?';
      description = `All eyes on ${opts.join(', ')} as they compete. Who rises to the occasion?`;
    } else if (isTeam) {
      question = 'Which team wins their upcoming fixture?';
      description = `Upcoming clashes: ${opts.join(', ')} — all in action this week.`;
    } else {
      question = 'Which of these dominates the sports headlines this week?';
      description = `In focus: ${opts.join(', ')}.`;
    }
  } else if (category === 'entertainment') {
    if (isSportsPerson) {
      // celebrities misclassified — still real names
      question = 'Which celebrity dominates entertainment headlines this week?';
      description = `${opts.join(', ')} — all making waves in entertainment news.`;
    } else {
      // Likely film titles extracted from box-office / collection / review headlines
      question = 'Which film leads the box office this weekend?';
      description = `Competing for the top spot: ${opts.join(', ')}.`;
    }
  } else if (category === 'finance') {
    if (isStock) {
      question = 'Which stock outperforms the market this week?';
      description = `In play: ${opts.join(', ')}. Earnings, FII activity, and macro cues in focus.`;
    } else if (isCrypto) {
      question = 'Which crypto asset sees the biggest weekly move?';
      description = `Tracking: ${opts.join(', ')} amid current macro sentiment.`;
    } else {
      question = 'Which sees the biggest market move this week?';
      description = `Watch: ${opts.join(', ')}.`;
    }
  } else {
    question = 'Which story leads the headlines this week?';
    description = `Top stories: ${opts.join(', ')}.`;
  }

  return {
    title: question,
    description,
    category,
    type: 'mcq',
    options: opts,
    optionPools: opts.map(() => Math.floor(Math.random() * 8000) + 4000),
    aiPredictedOption: Math.floor(Math.random() * opts.length),
    aiPrediction: parseFloat((0.25 + Math.random() * 0.35).toFixed(2)),
    yesPool: 0,
    noPool: 0,
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchNewsMarkets(): Promise<MarketDraft[]> {
  const results = await Promise.allSettled(
    FEEDS.map(feed =>
      fetchFeed(feed.url).then(items => ({ items, category: feed.category }))
    )
  );

  const binaryDrafts: MarketDraft[] = [];

  // Per-category entity buckets for dynamic MCQ building
  const entitiesByCategory: Partial<Record<Market['category'], string[]>> = {};

  // Dedup within binary batch (no two questions sharing 3+ significant words)
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
      if (!item.title) continue;

      // ── Binary question from this headline ────────────────────
      if (binaryDrafts.length < 16) {
        const question = headlineToQuestion(item.title);
        if (question && !isTooSimilar(question)) {
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

      // ── Extract entity for dynamic MCQ ────────────────────────
      const entity = extractSubjectEntity(item.title);
      if (entity) {
        if (!entitiesByCategory[category]) entitiesByCategory[category] = [];
        const arr = entitiesByCategory[category]!;
        // keep unique entities only, max 6 per category
        if (!arr.includes(entity) && arr.length < 6) arr.push(entity);
      }
    }
  }

  // ── Build dynamic MCQs from extracted real entities ───────────────────────
  // Prefer sports → entertainment → finance for variety
  const dynamicMCQs: MarketDraft[] = [];
  const categoryOrder: Market['category'][] = ['sports', 'entertainment', 'finance', 'platform'];

  for (const cat of categoryOrder) {
    if (dynamicMCQs.length >= 2) break;
    const entities = entitiesByCategory[cat];
    if (!entities || entities.length < 3) continue;
    const mcq = buildDynamicMCQ(entities, cat);
    if (mcq) dynamicMCQs.push(mcq);
  }

  // Mix in 2 static templates that have proven real names (teams, drivers, countries)
  const shuffledStatic = [...MCQ_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 2);

  return [...binaryDrafts, ...dynamicMCQs, ...shuffledStatic];
}
