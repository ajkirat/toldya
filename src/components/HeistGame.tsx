import { useState, useEffect, useRef, useCallback } from 'react';

type Phase = 'menu' | 'playing' | 'cracking' | 'busted' | 'gameover';
type Zone  = 'perfect' | 'good' | 'miss';

const PERFECT_DEG = 25;
const GOOD_DEG    = 50;
const BASE_SPEED  = 0.9;   // rotations/sec
const D           = 240;   // canvas px
const HS_KEY      = 'heist_hs_v1';

// ── Audio ─────────────────────────────────────────────────────────────────
let _actx: AudioContext | null = null;
function getACtx() {
  if (!_actx) {
    try {
      _actx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { /* no audio */ }
  }
  return _actx;
}
function tone(freq: number, type: OscillatorType, dur: number, vol = 0.3, delay = 0) {
  const ctx = getACtx(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type; o.frequency.value = freq;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t + delay);
  g.gain.linearRampToValueAtTime(vol, t + delay + 0.01);
  g.gain.linearRampToValueAtTime(0, t + delay + dur);
  o.start(t + delay); o.stop(t + delay + dur + 0.05);
}
const sfx = {
  perfect: () => { tone(523,'sine',0.10,0.4,0); tone(659,'sine',0.10,0.4,0.10); tone(784,'sine',0.15,0.4,0.20); },
  good:    () => { tone(440,'sine',0.12,0.3,0); tone(523,'sine',0.12,0.3,0.12); },
  miss:    () => { tone(220,'sawtooth',0.15,0.35,0); tone(180,'sawtooth',0.12,0.20,0.15); },
  levelup: () => [523,659,784,1047].forEach((f,i) => tone(f,'sine',0.12,0.4,i*0.12)),
};

// ── Zone helper ────────────────────────────────────────────────────────────
function checkZone(angle: number): Zone {
  const a = ((angle % 360) + 360) % 360;
  const d = Math.min(a, 360 - a);
  if (d <= PERFECT_DEG) return 'perfect';
  if (d <= GOOD_DEG)    return 'good';
  return 'miss';
}

// ── Canvas dial ────────────────────────────────────────────────────────────
function drawDial(canvas: HTMLCanvasElement, angle: number, phase: Phase) {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const cx = D / 2, cy = D / 2, R = D / 2 - 12, iR = R * 0.38;
  ctx.clearRect(0, 0, D, D);

  if (phase === 'cracking') { ctx.shadowColor = '#22ff77'; ctx.shadowBlur = 24; }
  else if (phase === 'busted') { ctx.shadowColor = '#ff3333'; ctx.shadowBlur = 24; }
  else ctx.shadowBlur = 0;

  // Miss (red)
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#bb1111'; ctx.fill();

  // Good (yellow)
  const gr = GOOD_DEG * Math.PI / 180;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, -Math.PI/2 - gr, -Math.PI/2 + gr);
  ctx.closePath(); ctx.fillStyle = '#f5c000'; ctx.fill();

  // Perfect (green)
  const pr = PERFECT_DEG * Math.PI / 180;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, -Math.PI/2 - pr, -Math.PI/2 + pr);
  ctx.closePath(); ctx.fillStyle = '#11cc55'; ctx.fill();

  ctx.shadowBlur = 0;

  // Gold border
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.stroke();

  // Ticks
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx + (R-7)*Math.cos(a), cy + (R-7)*Math.sin(a));
    ctx.lineTo(cx + R*Math.cos(a),     cy + R*Math.sin(a));
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = i % 3 === 0 ? 2.5 : 1;
    ctx.stroke();
  }

  // Inner dark ring
  ctx.beginPath(); ctx.arc(cx, cy, iR, 0, Math.PI * 2);
  ctx.fillStyle = '#080814'; ctx.fill();
  ctx.strokeStyle = '#2a2a5a'; ctx.lineWidth = 2; ctx.stroke();

  // Needle
  const nr = (angle - 90) * Math.PI / 180, nL = R - 10;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + nL*Math.cos(nr), cy + nL*Math.sin(nr));
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.shadowBlur = 0;

  // Needle tip (colour = current zone)
  const zone = checkZone(angle);
  ctx.beginPath();
  ctx.arc(cx + (nL-2)*Math.cos(nr), cy + (nL-2)*Math.sin(nr), 6, 0, Math.PI*2);
  ctx.fillStyle = zone === 'perfect' ? '#11cc55' : zone === 'good' ? '#f5c000' : '#ff3333';
  ctx.fill();

  // Pivot
  ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd700'; ctx.fill();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();

  // Target arrow ▼
  const ay = cy - R - 14;
  ctx.beginPath();
  ctx.moveTo(cx-7, ay-8); ctx.lineTo(cx+7, ay-8); ctx.lineTo(cx, ay+2);
  ctx.closePath();
  ctx.fillStyle = '#ffd700'; ctx.fill();
  ctx.strokeStyle = '#553300'; ctx.lineWidth = 1.5; ctx.stroke();
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HeistGame() {
  const [phase,     setPhase]     = useState<Phase>('menu');
  const [score,     setScore]     = useState(0);
  const [level,     setLevel]     = useState(1);
  const [lives,     setLives]     = useState(3);
  const [combo,     setCombo]     = useState(0);
  const [maxCombo,  setMaxCombo]  = useState(0);
  const [flash,     setFlash]     = useState<Zone | null>(null);
  const [showCoins, setShowCoins] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(HS_KEY) || '0', 10); } catch { return 0; }
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef  = useRef(0);
  const rafRef    = useRef(0);
  const lastTRef  = useRef(0);
  const phaseRef  = useRef<Phase>('menu');
  const speedRef  = useRef(BASE_SPEED);
  const scoreRef  = useRef(0);
  const levelRef  = useRef(1);
  const comboRef  = useRef(0);
  const livesRef  = useRef(3);
  const hsRef     = useRef(0);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; },     [phase]);
  useEffect(() => { scoreRef.current = score; },     [score]);
  useEffect(() => { levelRef.current = level; },     [level]);
  useEffect(() => { comboRef.current = combo; },     [combo]);
  useEffect(() => { livesRef.current = lives; },     [lives]);
  useEffect(() => { hsRef.current    = highScore; }, [highScore]);
  useEffect(() => {
    speedRef.current = BASE_SPEED + (level-1)*0.25 + Math.min(combo*0.05, 0.8);
  }, [level, combo]);

  // Menu: draw static dial preview
  useEffect(() => {
    if (phase !== 'menu') return;
    const c = canvasRef.current; if (!c) return;
    c.width = D; c.height = D;
    drawDial(c, 45, 'menu');
  }, [phase]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'cracking' && phase !== 'busted') return;
    const c = canvasRef.current; if (!c) return;
    if (c.width !== D) { c.width = D; c.height = D; }

    function tick(t: number) {
      if (lastTRef.current === 0) lastTRef.current = t;
      const dt = Math.min((t - lastTRef.current) / 1000, 0.05);
      lastTRef.current = t;
      if (phaseRef.current === 'playing') {
        angleRef.current = (angleRef.current + speedRef.current * 360 * dt) % 360;
      }
      const cv = canvasRef.current;
      if (cv) drawDial(cv, angleRef.current, phaseRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    lastTRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); lastTRef.current = 0; };
  }, [phase]);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    const actx = getACtx();
    if (actx?.state === 'suspended') actx.resume();

    const zone = checkZone(angleRef.current);
    setFlash(zone);

    if (zone === 'miss') {
      sfx.miss();
      setPhase('busted'); phaseRef.current = 'busted';
      const nl = livesRef.current - 1;
      setLives(nl); livesRef.current = nl;
      setCombo(0);  comboRef.current = 0;

      if (nl <= 0) {
        setTimeout(() => {
          const fs = scoreRef.current;
          if (fs > hsRef.current) {
            hsRef.current = fs;
            setHighScore(fs);
            try { localStorage.setItem(HS_KEY, fs.toString()); } catch { /* ignore */ }
          }
          setPhase('gameover'); phaseRef.current = 'gameover';
        }, 1000);
      } else {
        setTimeout(() => {
          setFlash(null);
          setPhase('playing'); phaseRef.current = 'playing';
        }, 900);
      }
    } else {
      zone === 'perfect' ? sfx.perfect() : sfx.good();
      setPhase('cracking'); phaseRef.current = 'cracking';
      setShowCoins(true);

      const nc = comboRef.current + 1;
      setCombo(nc); comboRef.current = nc;
      setMaxCombo(prev => Math.max(prev, nc));

      if (nc % 5 === 0) {
        sfx.levelup();
        const nl = levelRef.current + 1;
        setLevel(nl); levelRef.current = nl;
      }

      const pts    = zone === 'perfect' ? 100 : 50;
      const multi  = Math.floor(nc / 3) + 1;
      const earned = pts * multi * levelRef.current;
      const ns     = scoreRef.current + earned;
      setScore(ns); scoreRef.current = ns;

      setTimeout(() => {
        setShowCoins(false);
        setFlash(null);
        setPhase('playing'); phaseRef.current = 'playing';
      }, 850);
    }
  }, []);

  function startGame() {
    angleRef.current = 0; speedRef.current = BASE_SPEED;
    scoreRef.current = 0; levelRef.current = 1;
    livesRef.current = 3; comboRef.current = 0;
    setPhase('playing'); phaseRef.current = 'playing';
    setScore(0); setLevel(1); setLives(3);
    setCombo(0); setMaxCombo(0);
    setFlash(null); setShowCoins(false);
  }

  const comboMulti = Math.floor(combo / 3) + 1;

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (phase === 'menu') return (
    <div className="heist-screen screen">
      <div className="heist-bg-grid" />
      <div className="heist-menu">
        <div className="heist-logo">
          <span className="heist-crown">👑</span>
          <h1 className="heist-title">HEIST!</h1>
          <p className="heist-tagline">Crack the vault · Grab the gold</p>
        </div>

        <div className="heist-dial-preview-wrap">
          <canvas ref={canvasRef} className="heist-canvas" />
          <p className="heist-dial-hint">Tap when the needle hits GREEN!</p>
        </div>

        {highScore > 0 && (
          <div className="heist-hs-row">
            <span>🏆 BEST SCORE</span>
            <strong>{highScore.toLocaleString()}</strong>
          </div>
        )}

        <div className="heist-legend">
          <div className="heist-legend-row"><span className="heist-dot green" />Perfect (green) = 100 pts</div>
          <div className="heist-legend-row"><span className="heist-dot yellow" />Good (yellow) = 50 pts</div>
          <div className="heist-legend-row"><span className="heist-dot red" />Miss (red) = lose a life 💔</div>
          <div className="heist-legend-row">🔗 Every 3 cracks = combo bonus!</div>
        </div>

        <button className="heist-btn-primary" onClick={startGame}>
          🏦 START THE HEIST
        </button>
      </div>
    </div>
  );

  // ── GAME OVER ─────────────────────────────────────────────────────────────
  if (phase === 'gameover') {
    const isRecord = score > 0 && score >= highScore;
    return (
      <div className="heist-screen screen">
        <div className="heist-bg-grid" />
        <div className="heist-gameover">
          <div className="heist-go-icon">{isRecord ? '🏆' : '🚨'}</div>
          <h2 className="heist-go-title">{isRecord ? 'NEW RECORD!' : 'BUSTED!'}</h2>
          <p className="heist-go-sub">{isRecord ? 'You cracked it, legend!' : 'The guards got you...'}</p>
          <div className="heist-go-score">
            {score.toLocaleString()}<span className="heist-go-pts"> pts</span>
          </div>
          <div className="heist-go-stats">
            <div className="heist-stat"><span>Level</span><b>{level}</b></div>
            <div className="heist-stat"><span>Best Combo</span><b>×{maxCombo}</b></div>
            <div className="heist-stat"><span>High Score</span><b>{highScore.toLocaleString()}</b></div>
          </div>
          <button className="heist-btn-primary" onClick={startGame}>🔄 PLAY AGAIN</button>
          <button className="heist-btn-secondary" onClick={() => { setPhase('menu'); phaseRef.current = 'menu'; }}>
            MENU
          </button>
        </div>
      </div>
    );
  }

  // ── PLAY ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`heist-screen heist-play screen${phase === 'busted' ? ' heist-shake' : ''}`}
      onPointerDown={handleTap}
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <div className="heist-bg-grid" />

      {/* HUD */}
      <div className="heist-hud">
        <div className="heist-lives">
          {[1,2,3].map(i => <span key={i}>{i <= lives ? '❤️' : '🖤'}</span>)}
        </div>
        <div className="heist-hud-score">{score.toLocaleString()}</div>
        <div className="heist-level-badge">LVL {level}</div>
      </div>

      {/* Combo badge */}
      {combo >= 3 && (
        <div className="heist-combo-badge">
          <span className="heist-combo-x">×{comboMulti}</span> COMBO!
        </div>
      )}

      {/* Vault door */}
      <div className={`heist-vault${phase === 'cracking' ? ' open' : ''}${phase === 'busted' ? ' alarm' : ''}`}>
        <div className="heist-vault-door">
          <div className="heist-bolts"><span /><span /><span /><span /></div>
          <div className="heist-vault-face">
            {phase === 'cracking' ? '💰' : phase === 'busted' ? '🚨' : '🔒'}
          </div>
          <div className="heist-vault-brand">FEDERAL VAULT</div>
        </div>
        {showCoins && (
          <div className="heist-coins-burst">
            {[...Array(7)].map((_,i) => <span key={i} className={`heist-coin coin-${i}`}>💰</span>)}
          </div>
        )}
      </div>

      {/* Dial */}
      <div className="heist-dial-wrap">
        <canvas ref={canvasRef} className="heist-canvas" />
      </div>

      {/* Flash feedback */}
      {flash && (
        <div className={`heist-flash flash-${flash}`}>
          {flash === 'perfect' ? '⚡ PERFECT!' : flash === 'good' ? '✓ GOOD!' : '🚨 BUSTED!'}
        </div>
      )}

      {/* Tap cue */}
      {phase === 'playing' && (
        <div className="heist-tap-cue">
          <div className="heist-tap-ring" />
          TAP TO CRACK
        </div>
      )}

      {/* Guard alert */}
      <div className="heist-alert-bar">
        <span className="heist-alert-label">👮 GUARD</span>
        <div className="heist-alert-track">
          <div className="heist-alert-fill" style={{
            width: `${Math.min(5 + (level-1)*12 + combo*2, 98)}%`,
            background: level >= 5 ? '#ff3333' : level >= 3 ? '#ff8800' : '#ffcc00',
          }} />
        </div>
        <span className="heist-alert-label">ALERT</span>
      </div>
    </div>
  );
}
