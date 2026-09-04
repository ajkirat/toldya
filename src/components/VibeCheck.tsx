import { useState } from 'react';
import { haptic } from '../rantEngine';

const QUESTIONS = [
  { a: 'Slow WiFi that keeps dropping',        b: 'No WiFi and no data at all' },
  { a: 'Monday morning alarm',                  b: 'Sunday night anxiety spiral' },
  { a: 'Cold food delivered on time',           b: 'Hot food that arrived late' },
  { a: 'Passive-aggressive coworker',           b: 'Aggressively cheerful coworker' },
  { a: 'Phone dies at 1%',                      b: 'Charger stops mid-charge' },
  { a: 'Forgot umbrella and it poured',         b: 'Forgot wallet at the counter' },
  { a: 'Slow walker blocking your path',        b: 'Person who stops dead in front of you' },
  { a: 'On hold for 45 minutes',                b: 'Transferred across 5 departments' },
  { a: 'Alarm goes off 5 mins too early',       b: "Can't fall asleep at all" },
  { a: 'Reply-all chain with 40 people',        b: 'Meeting that was literally an email' },
];

type Phase = 'intro' | 'questions' | 'done' | 'results';

interface VibeParams {
  type: 'none' | 'invite' | 'result';
  fromName: string;
  fromAnswers: number[];
  score: number;
  toName: string;
}

function parseVibeParams(): VibeParams {
  const p = new URLSearchParams(window.location.search);
  const type = p.get('vibe');
  if (type === 'inv') {
    const raw = p.get('va') ?? '';
    return {
      type: 'invite',
      fromName: decodeURIComponent(p.get('vf') ?? 'Someone'),
      fromAnswers: raw.split('').map(Number).filter(n => n === 0 || n === 1),
      score: 0,
      toName: '',
    };
  }
  if (type === 'res') {
    return {
      type: 'result',
      fromName: decodeURIComponent(p.get('vf') ?? 'Friend'),
      fromAnswers: [],
      score: parseInt(p.get('vs') ?? '0', 10),
      toName: decodeURIComponent(p.get('vt') ?? 'you'),
    };
  }
  return { type: 'none', fromName: '', fromAnswers: [], score: 0, toName: '' };
}

function vibeLabel(score: number) {
  if (score <= 2) return { label: 'Total Chaos 💀',     sub: 'You rant on completely different wavelengths', color: '#7c3aed', pct: 15 };
  if (score <= 4) return { label: 'Rant Strangers ⚡',  sub: 'You agree on the basics, clash on the rest',   color: '#f97316', pct: 35 };
  if (score <= 6) return { label: 'Rant Cousins 🤝',   sub: "You get each other's frustrations halfway",    color: '#eab308', pct: 58 };
  if (score <= 8) return { label: 'Rant Partners 🔥',  sub: 'Your rage is deeply, dangerously aligned',     color: '#ef4444', pct: 80 };
  return             { label: 'RANT SOULMATES 😤',     sub: 'You are literally the same raging person',     color: '#f97316', pct: 100 };
}

interface Props {
  username: string;
}

export default function VibeCheck({ username }: Props) {
  const params = parseVibeParams();

  const initPhase: Phase =
    params.type === 'result'  ? 'results'   :
    params.type === 'invite'  ? 'questions' :
    'intro';

  const [phase, setPhase]       = useState<Phase>(initPhase);
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState<number[]>([]);
  const [score, setScore]       = useState(params.type === 'result' ? params.score : 0);
  const [copied, setCopied]     = useState(false);

  const friendName = params.fromName || 'Friend';

  function pick(choice: 0 | 1) {
    haptic('light');
    const next = [...answers, choice];
    setAnswers(next);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(q => q + 1);
    } else {
      if (params.type === 'invite' && params.fromAnswers.length === QUESTIONS.length) {
        const s = next.filter((a, i) => a === params.fromAnswers[i]).length;
        setScore(s);
        setPhase('results');
      } else {
        setPhase('done');
      }
    }
  }

  function buildInviteLink() {
    const base = 'https://rantr.vercel.app';
    return `${base}?vibe=inv&vf=${encodeURIComponent(username)}&va=${answers.join('')}`;
  }

  function buildResultLink() {
    const base = 'https://rantr.vercel.app';
    return `${base}?vibe=res&vf=${encodeURIComponent(username)}&vt=${encodeURIComponent(friendName)}&vs=${score}`;
  }

  function shareLink(link: string, isResult: boolean) {
    haptic('medium');
    const vibe = vibeLabel(score);
    const text = isResult
      ? `${username} & ${friendName} got "${vibe.label}" on the Rant Vibe Check 😤 ${score}/10 — see how you match!\n${link}`
      : `${username} wants to do a Rant Vibe Check with you 😤 Answer 10 questions, find out how much your rage aligns. Takes 30 seconds.\n${link}`;
    if (navigator.share) {
      navigator.share({ title: 'rantr Vibe Check 😤', text, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }

  const vibe = vibeLabel(score);

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="screen vibe-screen">
        <div className="vibe-intro-wrap">
          <div className="vibe-graphic">
            <div className="vibe-graphic-ring vibe-ring-1" />
            <div className="vibe-graphic-ring vibe-ring-2" />
            <div className="vibe-graphic-ring vibe-ring-3" />
            <div className="vibe-graphic-center">
              <span className="vibe-emoji-a">😤</span>
              <span className="vibe-emoji-cross">×</span>
              <span className="vibe-emoji-b">😤</span>
            </div>
          </div>
          <div className="vibe-intro-title">Rant Vibe Check</div>
          <div className="vibe-intro-sub">
            10 questions. 2 choices each.<br />
            Find out how much your rage aligns.
          </div>
          <button
            className="vibe-start-btn"
            onClick={() => { haptic('medium'); setPhase('questions'); }}
          >
            🔥 Start Vibe Check
          </button>
          <button
            className="vibe-invite-outline-btn"
            onClick={() => {
              haptic('medium');
              const link = 'https://rantr.vercel.app';
              const text = `${username} wants to do a Rant Vibe Check with you 😤 — find out how much your rage aligns on rantr!\n${link}`;
              if (navigator.share) {
                navigator.share({ title: 'rantr Vibe Check 😤', text, url: link }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }).catch(() => {});
              }
            }}
          >
            {copied ? '✅ Copied!' : '👋 Invite a Friend'}
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTIONS ─────────────────────────────────────────────────────────────
  if (phase === 'questions') {
    const q   = QUESTIONS[qIdx];
    const pct = ((qIdx) / QUESTIONS.length) * 100;
    return (
      <div className="screen vibe-screen">
        {params.type === 'invite' && (
          <div className="vibe-invite-banner">
            👋 <strong>{friendName}</strong> wants to vibe check with you!
          </div>
        )}
        <div className="vibe-q-header">
          <div className="vibe-progress-bar">
            <div className="vibe-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="vibe-q-count">{qIdx + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="vibe-q-label">Which annoys you more?</div>
        <div className="vibe-choices">
          <button className="vibe-choice-btn" onClick={() => pick(0)}>
            <span className="vibe-choice-emoji">😤</span>
            <span className="vibe-choice-text">{q.a}</span>
          </button>
          <div className="vibe-or-divider">OR</div>
          <button className="vibe-choice-btn" onClick={() => pick(1)}>
            <span className="vibe-choice-emoji">🔥</span>
            <span className="vibe-choice-text">{q.b}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── DONE (answered, waiting to invite) ───────────────────────────────────
  if (phase === 'done') {
    const link = buildInviteLink();
    return (
      <div className="screen vibe-screen">
        <div className="vibe-done-wrap">
          <div className="vibe-done-icon">🔥</div>
          <div className="vibe-done-title">Rant vibe locked in!</div>
          <div className="vibe-done-sub">
            Now send this to a friend.<br />
            When they answer, you'll both see your score.
          </div>
          <button className="vibe-start-btn" onClick={() => shareLink(link, false)}>
            {copied ? '✅ Link Copied!' : '👋 Invite a Friend'}
          </button>
          <div className="vibe-done-hint">
            They answer the same 10 questions → score shows on both screens
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  const nameA = params.type === 'invite' ? friendName : username;
  const nameB = params.type === 'invite' ? username   : friendName;

  return (
    <div className="screen vibe-screen">
      <div className="vibe-results-wrap">
        <div className="vibe-results-names">
          <span className="vibe-name-chip">{nameA}</span>
          <span className="vibe-names-x">×</span>
          <span className="vibe-name-chip">{nameB}</span>
        </div>

        {/* Meter */}
        <div className="vibe-meter-outer">
          <div className="vibe-meter-track">
            <div
              className="vibe-meter-fill"
              style={{ width: `${vibe.pct}%`, background: `linear-gradient(90deg, ${vibe.color}, #f97316)` }}
            />
          </div>
          <div className="vibe-meter-score">
            <span className="vibe-score-num">{score}</span>
            <span className="vibe-score-denom">/10</span>
          </div>
        </div>

        <div className="vibe-result-label" style={{ color: vibe.color }}>{vibe.label}</div>
        <div className="vibe-result-sub">{vibe.sub}</div>

        <button
          className="vibe-start-btn"
          onClick={() => shareLink(buildResultLink(), true)}
        >
          {copied ? '✅ Copied!' : '📤 Share Result'}
        </button>

        {params.type === 'invite' && (
          <div className="vibe-done-hint">
            Share this so {friendName} can see the score too!
          </div>
        )}
      </div>
    </div>
  );
}
