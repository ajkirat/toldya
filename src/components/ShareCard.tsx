import { useMemo, useState } from 'react';
import type { Rant, Action } from '../types';
import { formatCount, getReputation, haptic } from '../rantEngine';
import { sfxPost, sfxNav, sfxDismiss } from '../sfx';

interface Props {
  rant: Rant;
  dispatch: (a: Action) => void;
}

export default function ShareCard({ rant, dispatch }: Props) {
  const [copied, setCopied] = useState(false);
  const initials = rant.author.slice(0, 2).toUpperCase();
  const rep = getReputation(rant.isBot ? 15 : 1);

  const waveBars = useMemo(
    () => Array.from({ length: 24 }, () => 20 + Math.random() * 80),
    []
  );

  const shareText = `"${rant.title}" — listen & react on rantr`;
  const shareUrl  = 'https://rantr.vercel.app';

  function handleWhatsApp() {
    haptic('light');
    sfxNav();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  }

  function handleTwitter() {
    haptic('light');
    sfxNav();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function handleInsta() {
    haptic('medium');
    sfxNav();
    // Instagram doesn't support URL-based deep sharing — use native share sheet
    // which the user can then target at Instagram Stories, or fall back to clipboard.
    const text = `${shareText} ${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: 'rantr 😤', text, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  }

  function handleCopy() {
    haptic('medium');
    sfxPost();
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function done() {
    haptic('light');
    sfxDismiss();
    dispatch({ type: 'NAVIGATE', view: 'feed' });
  }

  return (
    <div className="screen">
      <div className="share-screen">
        <div className="share-screen-title">YOUR RANT IS LIVE 🔥</div>
        <div className="share-screen-sub">share it with your people</div>

        {/* The card */}
        <div className="share-card">
          <div className="share-card-header">
            <div className="share-card-brand">RAN<span>TR</span></div>
            <div className="share-cat-badge">{rant.category}</div>
          </div>

          <div className="share-card-body">
            <div className="share-author-row">
              <div className="share-avatar">{initials}</div>
              <div>
                <div className="share-author-name">{rant.author}</div>
                <div className="share-author-rep">{rep} Ranter</div>
              </div>
            </div>

            <div className="share-rant-title">{rant.title}</div>

            {/* Static waveform decoration */}
            <div className="share-waveform-deco">
              {waveBars.map((h, i) => (
                <div
                  key={i}
                  className="share-wave-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Reaction stats */}
            <div className="share-stats-row">
              <div className="share-stat">
                <span className="share-stat-emoji">🔥</span>
                <span className="share-stat-count">{formatCount(rant.reactions.relatable)}</span>
                <span className="share-stat-label">Relatable</span>
              </div>
              <div className="share-stat">
                <span className="share-stat-emoji">😂</span>
                <span className="share-stat-count">{formatCount(rant.reactions.funny)}</span>
                <span className="share-stat-label">Funny</span>
              </div>
              <div className="share-stat">
                <span className="share-stat-emoji">🎯</span>
                <span className="share-stat-count">{formatCount(rant.reactions.accurate)}</span>
                <span className="share-stat-label">Accurate</span>
              </div>
            </div>
          </div>

          <div className="share-card-footer">
            <span className="share-footer-url">rantr.vercel.app</span>
            <span className="share-footer-cta">listen & react →</span>
          </div>
        </div>

        {/* Invite nudge — post-rant viral loop */}
        <div className="share-invite-nudge">
          <span className="share-invite-nudge-text">
            👋 Got friends who rage too?
          </span>
          <button
            className="share-invite-nudge-btn"
            onClick={() => {
              haptic('medium');
              const text = `come rant with me on rantr 😤 — tiny rage. big community.`;
              const url  = 'https://rantr.vercel.app';
              if (navigator.share) {
                navigator.share({ title: 'rantr 😤', text, url }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }).catch(() => {});
              }
            }}
          >
            {copied ? '✅ Copied!' : 'Invite them →'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="share-buttons">
          <button className="share-btn whatsapp" onClick={handleWhatsApp}>
            📱 WhatsApp
          </button>
          <button className="share-btn twitter" onClick={handleTwitter}>
            𝕏 Post
          </button>
          <button className="share-btn copy" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '🔗 Copy link'}
          </button>
          <button className="share-btn insta" onClick={handleInsta}>
            📸 Instagram
          </button>
        </div>

        {/* Done */}
        <button className="share-done-btn" onClick={done}>
          Done → Back to feed
        </button>
      </div>
    </div>
  );
}
