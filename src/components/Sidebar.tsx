'use client';

import React from 'react';
import { LayoutDashboard, Settings, BarChart3, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Nav Item Config ──────────────────────────────────────────────────────────
// To add a new lead source (e.g. Twitter, LinkedIn), just add an entry here.

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string; // optional pill label (e.g. "New")
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    icon: <LayoutDashboard size={20} />,
    label: 'Google Leads',
  },
  {
    href: '/reddit-leads',
    icon: (
      // Inline Reddit alien icon — keeps the dependency footprint minimal
      <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
        <path d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10 10-4.478 10-10S15.522 0 10 0zm5.89 11.584a2.21 2.21 0 0 1 .11.666c0 2.32-2.7 4.2-6.03 4.2s-6.03-1.88-6.03-4.2c0-.23.04-.453.11-.666a1.404 1.404 0 0 1-.44-2.564 1.392 1.392 0 0 1 1.56.202A6.977 6.977 0 0 1 9 8.137l.87-2.942a.282.282 0 0 1 .339-.198l2.07.436a.97.97 0 1 1-.097.562l-1.87-.394-.78 2.655a6.98 6.98 0 0 1 3.808 1.085 1.393 1.393 0 0 1 2.55 1.243zm-8.44.416a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm5.39 2.624a3.198 3.198 0 0 1-2.84.83 3.198 3.198 0 0 1-2.84-.83.26.26 0 0 0-.37.366 3.72 3.72 0 0 0 3.21.964 3.72 3.72 0 0 0 3.21-.964.26.26 0 0 0-.37-.366zm-.39-1.624a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
      </svg>
    ),
    label: 'Reddit Leads',
    badge: 'New',
  },
  // ── Future sources ──────────────────────────────────────────────────────────
  // { href: '/twitter-leads', icon: <Twitter size={20} />, label: 'X / Twitter Leads', badge: 'Soon' },
  // { href: '/linkedin-leads', icon: <Linkedin size={20} />, label: 'LinkedIn Leads', badge: 'Soon' },
];

// ─── Sidebar Component ────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-icon"><BarChart3 size={24} /></div>
        <span className="logo-text">LeadGenPro</span>
      </div>

      {/* Section: Lead Sources */}
      <div style={{ marginBottom: '0.5rem', padding: '0 0.5rem' }}>
        <p style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          margin: '0 0 0.5rem',
        }}>
          Lead Sources
        </p>
      </div>

      <nav className="sidebar-nav flex flex-col gap-2">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
              style={{ position: 'relative' }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,69,0,0.15)',
                  color: isActive ? 'var(--color-primary)' : '#ff4500',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom nav */}
      <nav className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
        <Link href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>LeadGenPro v1.1</div>
          <div style={{ opacity: 0.75 }}>Google + Reddit sources</div>
        </div>
      </div>
    </aside>
  );
}
