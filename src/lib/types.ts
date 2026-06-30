export interface WebsiteAnalysis {
  exists: boolean;
  mobileResponsive: boolean;
  sslValid: boolean;
  loadSpeedMs: number;
  modernDesign: boolean;
  hasContactForm: boolean;
  hasSocialLinks: boolean;
}

export type LeadStatus = 'Hot Lead' | 'Warm Lead' | 'Low Priority';

export interface BusinessLead {
  id: string;
  name: string;
  category: string;
  location: string;
  websiteUrl: string | null;
  phone: string;
  address: string;
  rating: number;
  reviewCount: number;
  websiteAnalysis: WebsiteAnalysis | null;
  score: number;
  status: LeadStatus;
}

// ─── Reddit Lead Source ─────────────────────────────────────────────────────

export interface RedditLead {
  id: string;
  username: string;
  subreddit: string;
  title: string;
  postUrl: string;
  createdAt: string;        // ISO timestamp
  upvotes: number;
  aiScore: number;          // 0–100
  reason: string;           // Human-readable explanation of score
  suggestedService: string; // e.g. "Landing Page", "E-commerce Site"
  saved: boolean;
  selftext?: string;        // Post body text (may be empty)
}

// ─── Future Lead Sources (placeholder types for extensibility) ─────────────

// export interface TwitterLead { ... }
// export interface LinkedInLead { ... }
