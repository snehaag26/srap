'use client';

import React from 'react';
import { RedditLead } from '@/lib/types';
import { X, Copy, CheckCircle2, MessageSquare } from 'lucide-react';

interface RedditOutreachModalProps {
  lead: RedditLead | null;
  onClose: () => void;
}

function generateOutreachMessage(lead: RedditLead): string {
  const service = lead.suggestedService || 'a professional website';

  const openers = [
    `Hey u/${lead.username}!`,
    `Hi u/${lead.username},`,
  ];
  const opener = openers[Math.abs(lead.id.charCodeAt(0)) % openers.length];

  return `${opener}

I came across your post in r/${lead.subreddit} — "${lead.title}" — and it really resonated with me.

I'm a web developer who specializes in helping ${
    lead.subreddit === 'smallbusiness' || lead.subreddit === 'Entrepreneur'
      ? 'small business owners and entrepreneurs'
      : lead.subreddit === 'startups'
      ? 'startups and early-stage teams'
      : lead.subreddit === 'freelance' || lead.subreddit === 'forhire'
      ? 'freelancers and consultants'
      : 'business owners'
  } establish a strong online presence.

Based on what you shared, it sounds like you could benefit from ${service.toLowerCase().startsWith('a') ? service : `a ${service}`}. I've helped similar clients go from zero to a polished, fast, and conversion-focused website — typically within 1–2 weeks.

I'd love to offer you a free 15-minute call to chat about what you're looking for — no pressure, just a conversation.

Would that be something you're open to?

Best,
[Your Name]
[Your Website / Portfolio]`;
}

export function RedditOutreachModal({ lead, onClose }: RedditOutreachModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!lead) return null;

  const message = generateOutreachMessage(lead);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} style={{ color: 'var(--color-secondary)' }} />
            <h3 style={{ margin: 0 }}>Reddit Outreach Message</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            <MessageSquare size={14} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: 2 }} />
            <span>Generated for <strong style={{ color: 'var(--text-main)' }}>u/{lead.username}</strong> in <strong style={{ color: 'var(--text-main)' }}>r/{lead.subreddit}</strong> based on their post context and suggested service: <em>{lead.suggestedService}</em>.</span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-base)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: 1.7,
              color: 'var(--text-main)',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {message}
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-panel)',
          }}
        >
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <div className="flex items-center gap-2">
            <a
              href={lead.postUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ textDecoration: 'none' }}
            >
              View Post
            </a>
            <button className="btn btn-primary" onClick={handleCopy}>
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
