'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Loader2, Filter, Download, ExternalLink,
  MessageSquare, Bookmark, BookmarkCheck, TrendingUp,
  Users, BarChart2, Hash, ArrowUpCircle, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { RedditLead } from '@/lib/types';
import { scoreRedditPost } from '@/lib/redditScoring';
import { RedditOutreachModal } from '@/components/RedditOutreachModal';

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_KEYWORDS = [
  'need a website', 'web developer', 'landing page', 'Shopify',
  'startup', 'restaurant', 'dentist', 'online store',
];

const SUBREDDIT_OPTIONS = [
  { value: 'smallbusiness', label: 'r/smallbusiness' },
  { value: 'Entrepreneur', label: 'r/Entrepreneur' },
  { value: 'startups', label: 'r/startups' },
  { value: 'freelance', label: 'r/freelance' },
  { value: 'forhire', label: 'r/forhire' },
  { value: 'webdev', label: 'r/webdev' },
  { value: 'web_design', label: 'r/web_design' },
  { value: 'ecommerce', label: 'r/ecommerce' },
];

const DEFAULT_SUBREDDITS = ['smallbusiness', 'Entrepreneur', 'startups', 'freelance'];

// ─── Score Badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--color-success)'
    : score >= 40 ? 'var(--color-warning)'
    : 'var(--color-danger)';
  const bg = score >= 70 ? 'rgba(16,185,129,0.1)'
    : score >= 40 ? 'rgba(245,158,11,0.1)'
    : 'rgba(239,68,68,0.1)';
  const label = score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Cool';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color }}>{score}</span>
        <span
          className="badge"
          style={{ backgroundColor: bg, color, fontSize: '0.7rem' }}
        >
          {label}
        </span>
      </div>
      {/* Score bar */}
      <div style={{ width: '80px', height: '4px', borderRadius: '9999px', backgroundColor: 'var(--border-color)' }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          borderRadius: '9999px',
          backgroundColor: color,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

// ─── Analytics Cards ─────────────────────────────────────────────────────────

function RedditAnalyticsCards({ leads }: { leads: RedditLead[] }) {
  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter(l => l.aiScore >= 70).length;
    const subreddits = new Set(leads.map(l => l.subreddit)).size;
    const avg = total > 0 ? Math.round(leads.reduce((a, l) => a + l.aiScore, 0) / total) : 0;
    return { total, hot, subreddits, avg };
  }, [leads]);

  const cards = [
    { label: 'Total Posts', value: stats.total, icon: <Users size={22} />, color: 'var(--color-primary)', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Hot Leads (70+)', value: stats.hot, icon: <TrendingUp size={22} />, color: '#ff4500', bg: 'rgba(255,69,0,0.1)' },
    { label: 'Subreddits Scanned', value: stats.subreddits, icon: <Hash size={22} />, color: 'var(--color-secondary)', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Avg AI Score', value: stats.avg, icon: <BarChart2 size={22} />, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
  ];

  return (
    <div className="analytics-grid">
      {cards.map(c => (
        <div key={c.label} className="card stat-card hover-lift">
          <div className="stat-icon-wrapper" style={{ backgroundColor: c.bg, color: c.color }}>
            {c.icon}
          </div>
          <div className="stat-content">
            <p className="stat-label">{c.label}</p>
            <h3 className="stat-value">{c.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedditLeadsPage() {
  // ── Search state
  const [keywordInput, setKeywordInput] = useState(DEFAULT_KEYWORDS.slice(0, 4).join(', '));
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>(DEFAULT_SUBREDDITS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Leads state
  const [leads, setLeads] = useState<RedditLead[]>([]);

  // ── Filter state
  const [minScore, setMinScore] = useState(0);
  const [filterSubreddit, setFilterSubreddit] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');

  // ── Modal state
  const [outreachLead, setOutreachLead] = useState<RedditLead | null>(null);

  // ── UI state
  const [showSubredditPicker, setShowSubredditPicker] = useState(false);

  const toggleSubreddit = useCallback((sub: string) => {
    setSelectedSubreddits(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  }, []);

  const handleSearch = async () => {
    const keywords = keywordInput
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (keywords.length === 0) {
      setError('Please enter at least one keyword.');
      return;
    }
    if (selectedSubreddits.length === 0) {
      setError('Please select at least one subreddit.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLeads([]);

    try {
      const res = await fetch('/api/reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, subreddits: selectedSubreddits, limit: 25 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch Reddit posts');
      }

      const rawPosts = data.posts || [];
      const scored: RedditLead[] = rawPosts.map((post: any) => {
        const { aiScore, reason, suggestedService } = scoreRedditPost(post.title, post.selftext);
        return {
          id: post.id,
          username: post.author,
          subreddit: post.subreddit,
          title: post.title,
          postUrl: post.permalink,
          createdAt: new Date(post.created_utc * 1000).toISOString(),
          upvotes: post.ups || 0,
          aiScore,
          reason,
          suggestedService,
          saved: false,
          selftext: post.selftext,
        };
      });

      // Sort by AI score descending
      scored.sort((a, b) => b.aiScore - a.aiScore);
      setLeads(scored);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback((id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, saved: !l.saved } : l));
  }, []);

  const handleExport = () => {
    const rows = [
      ['Username', 'Subreddit', 'Title', 'URL', 'Created', 'Upvotes', 'AI Score', 'Reason', 'Suggested Service'],
      ...filteredLeads.map(l => [
        l.username,
        l.subreddit,
        `"${l.title.replace(/"/g, '""')}"`,
        l.postUrl,
        new Date(l.createdAt).toLocaleDateString(),
        String(l.upvotes),
        String(l.aiScore),
        `"${l.reason.replace(/"/g, '""')}"`,
        l.suggestedService,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reddit-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived data
  const availableSubreddits = useMemo(() => {
    const subs = new Set(leads.map(l => l.subreddit));
    return Array.from(subs).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const now = Date.now();
    const cutoffs: Record<string, number> = {
      today: now - 24 * 60 * 60 * 1000,
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = cutoffs[filterDate] ?? 0;

    return leads.filter(lead => {
      if (lead.aiScore < minScore) return false;
      if (filterSubreddit && lead.subreddit !== filterSubreddit) return false;
      if (filterDate !== 'all' && new Date(lead.createdAt).getTime() < cutoff) return false;
      if (filterKeyword) {
        const kw = filterKeyword.toLowerCase();
        if (!lead.title.toLowerCase().includes(kw) && !lead.username.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [leads, minScore, filterSubreddit, filterDate, filterKeyword]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff4500, #ff6534)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="white">
                <circle cx="10" cy="10" r="10" fill="#FF4500"/>
                <path d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 .22-.66l-2.38-.5a.26.26 0 0 0-.31.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .49-1.24zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.59 2.71a3.58 3.58 0 0 1-2.86.86 3.58 3.58 0 0 1-2.86-.86.26.26 0 0 1 .36-.38 3.27 3.27 0 0 0 2.5.65 3.27 3.27 0 0 0 2.5-.65.26.26 0 0 1 .36.38zm-.22-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" fill="white"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Reddit Leads</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Find business owners on Reddit who need web development services — powered by AI scoring.
          </p>
        </div>
      </div>

      {/* ── Search Form ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', marginTop: 0 }}>
          Search Reddit Posts
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Keywords input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Keywords <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                type="text"
                className="input-base"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. need a website, landing page, Shopify, web developer"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {DEFAULT_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => {
                    const current = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
                    if (!current.includes(kw)) {
                      setKeywordInput([...current, kw].join(', '));
                    }
                  }}
                  style={{
                    fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--color-primary)';
                    (e.target as HTMLElement).style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--border-color)';
                    (e.target as HTMLElement).style.color = 'var(--text-muted)';
                  }}
                >
                  + {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Subreddit selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Subreddits <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({selectedSubreddits.length} selected)</span>
            </label>
            <button
              onClick={() => setShowSubredditPicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-panel)',
                color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.875rem',
                width: '100%', justifyContent: 'space-between',
              }}
            >
              <span>
                {selectedSubreddits.length > 0
                  ? selectedSubreddits.map(s => `r/${s}`).join(', ')
                  : 'Select subreddits...'}
              </span>
              {showSubredditPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSubredditPicker && (
              <div style={{
                marginTop: '0.5rem', padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-panel)',
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                {SUBREDDIT_OPTIONS.map(opt => {
                  const selected = selectedSubreddits.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleSubreddit(opt.value)}
                      style={{
                        padding: '0.35rem 0.875rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem', fontWeight: 500,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: selected ? '1px solid #ff4500' : '1px solid var(--border-color)',
                        backgroundColor: selected ? 'rgba(255,69,0,0.1)' : 'var(--bg-base)',
                        color: selected ? '#ff4500' : 'var(--text-muted)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '0 2rem', height: '42px', minWidth: '160px' }}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading
                ? <><Loader2 size={18} className="spin" /> Scanning Reddit...</>
                : <><Search size={18} /> Search Leads</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="card flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--color-danger)',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <div>
            <strong>Error: </strong>{error}
            {error.includes('credentials') && (
              <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', opacity: 0.85 }}>
                Add <code>REDDIT_CLIENT_ID</code> and <code>REDDIT_CLIENT_SECRET</code> to your <code>.env.local</code> file.{' '}
                <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noreferrer">Create a Reddit app →</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Results section ── */}
      {leads.length > 0 && (
        <>
          {/* Analytics Cards */}
          <RedditAnalyticsCards leads={filteredLeads} />

          {/* Filter Panel */}
          <div className="card flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex items-center gap-4" style={{ flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2">
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters</span>
              </div>

              {/* AI Score */}
              <select
                className="input-base"
                style={{ width: 'auto', minWidth: '130px' }}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
              >
                <option value={0}>Any AI Score</option>
                <option value={40}>Score 40+</option>
                <option value={60}>Score 60+</option>
                <option value={70}>Score 70+</option>
                <option value={85}>Score 85+</option>
              </select>

              {/* Subreddit */}
              <select
                className="input-base"
                style={{ width: 'auto', minWidth: '160px' }}
                value={filterSubreddit}
                onChange={e => setFilterSubreddit(e.target.value)}
              >
                <option value="">All Subreddits</option>
                {availableSubreddits.map(s => (
                  <option key={s} value={s}>r/{s}</option>
                ))}
              </select>

              {/* Date */}
              <select
                className="input-base"
                style={{ width: 'auto', minWidth: '130px' }}
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
              >
                <option value="all">Any Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Keyword search */}
              <input
                type="text"
                className="input-base"
                style={{ minWidth: '180px', maxWidth: '220px' }}
                placeholder="Filter by keyword…"
                value={filterKeyword}
                onChange={e => setFilterKeyword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline"
                onClick={() => { setMinScore(0); setFilterSubreddit(''); setFilterDate('all'); setFilterKeyword(''); }}
                style={{ fontSize: '0.8125rem' }}
              >
                <RefreshCw size={14} /> Reset
              </button>
              <button className="btn btn-primary" onClick={handleExport}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* Lead Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Post Details</th>
                  <th>Subreddit</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Posted</th>
                  <th style={{ whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1"><ArrowUpCircle size={14} />Upvotes</div>
                  </th>
                  <th style={{ whiteSpace: 'nowrap' }}>AI Score</th>
                  <th>Reason &amp; Service</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No leads match your current filters.
                    </td>
                  </tr>
                ) : null}
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover-lift-row">
                    {/* Post details */}
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.9rem', lineHeight: 1.4 }}>
                        {lead.title.length > 80 ? `${lead.title.slice(0, 80)}…` : lead.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        u/{lead.username}
                      </div>
                    </td>

                    {/* Subreddit badge */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(255,69,0,0.1)',
                          color: '#ff4500',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        r/{lead.subreddit}
                      </span>
                    </td>

                    {/* Created time */}
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {formatDate(lead.createdAt)}
                    </td>

                    {/* Upvotes */}
                    <td>
                      <div className="flex items-center gap-1" style={{ color: lead.upvotes > 0 ? 'var(--color-warning)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <ArrowUpCircle size={14} />
                        {lead.upvotes.toLocaleString()}
                      </div>
                    </td>

                    {/* AI Score */}
                    <td>
                      <ScoreBadge score={lead.aiScore} />
                    </td>

                    {/* Reason & Service */}
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.35rem' }}>
                        {lead.reason.length > 90 ? `${lead.reason.slice(0, 90)}…` : lead.reason}
                      </div>
                      <span
                        className="badge badge-info"
                        style={{ fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        {lead.suggestedService}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex flex-col gap-2" style={{ minWidth: '140px' }}>
                        <a
                          href={lead.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline"
                          style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '0.35rem 0.75rem', justifyContent: 'center' }}
                        >
                          <ExternalLink size={13} /> View Post
                        </a>
                        <button
                          className="btn btn-outline"
                          onClick={() => setOutreachLead(lead)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', color: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}
                        >
                          <MessageSquare size={13} /> Outreach
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleSave(lead.id)}
                          style={{
                            fontSize: '0.8rem', padding: '0.35rem 0.75rem',
                            color: lead.saved ? 'var(--color-success)' : 'var(--text-muted)',
                            borderColor: lead.saved ? 'var(--color-success)' : 'var(--border-color)',
                          }}
                        >
                          {lead.saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                          {lead.saved ? 'Saved' : 'Save Lead'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length > 0 && (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'right' }}>
              Showing {filteredLeads.length} of {leads.length} posts
            </p>
          )}
        </>
      )}

      {/* Empty state (initial) */}
      {!isLoading && leads.length === 0 && !error && (
        <div
          className="card"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '4rem 2rem', gap: '1rem',
            textAlign: 'center', border: '1px dashed var(--border-color)',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,69,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 20 20" width="36" height="36" fill="none">
              <circle cx="10" cy="10" r="10" fill="#FF4500"/>
              <path d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.08 2.13.45a1 1 0 1 0 .22-.66l-2.38-.5a.26.26 0 0 0-.31.2l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .49-1.24zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.59 2.71a3.58 3.58 0 0 1-2.86.86 3.58 3.58 0 0 1-2.86-.86.26.26 0 0 1 .36-.38 3.27 3.27 0 0 0 2.5.65 3.27 3.27 0 0 0 2.5-.65.26.26 0 0 1 .36.38zm-.22-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" fill="white"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No leads yet</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '400px', fontSize: '0.9rem' }}>
              Enter keywords and select subreddits above, then click <strong>Search Leads</strong> to scan Reddit for potential web development clients.
            </p>
          </div>
        </div>
      )}

      {/* Outreach Modal */}
      {outreachLead && (
        <RedditOutreachModal
          lead={outreachLead}
          onClose={() => setOutreachLead(null)}
        />
      )}
    </>
  );
}
