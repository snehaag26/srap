/**
 * Reddit Lead Scoring Engine
 *
 * Analyzes a Reddit post's title and body text using weighted keyword signals
 * to produce an AI Lead Score (0–100) indicating the likelihood that the
 * poster needs web development services.
 *
 * Designed to be stateless and pure — no external API calls.
 * Drop-in replaceable with an LLM-based scorer if desired.
 */

interface ScoringResult {
  aiScore: number;
  reason: string;
  suggestedService: string;
}

// ─── Signal Dictionaries ────────────────────────────────────────────────────

const HIGH_INTENT_SIGNALS = [
  { terms: ['need a website', 'need website', 'need a web', 'looking for a website'], weight: 30, label: 'explicitly needs a website' },
  { terms: ['hire a web developer', 'hire web developer', 'looking for developer', 'need a developer', 'need developer'], weight: 28, label: 'actively hiring a developer' },
  { terms: ['build a website', 'build my website', 'build our website', 'website built', 'get a website'], weight: 25, label: 'wants to build a website' },
  { terms: ['landing page', 'landing pages'], weight: 22, label: 'needs a landing page' },
  { terms: ['no website', "don't have a website", "don't have website", "no online presence"], weight: 22, label: 'has no online presence' },
  { terms: ['shopify', 'woocommerce', 'e-commerce site', 'ecommerce site', 'online store', 'online shop'], weight: 20, label: 'needs an e-commerce solution' },
  { terms: ['wordpress', 'wix', 'squarespace', 'webflow'], weight: 15, label: 'exploring website platforms' },
  { terms: ['web design', 'web designer', 'website design', 'redesign my website', 'redesign website'], weight: 18, label: 'needs web design help' },
];

const BUSINESS_CONTEXT_SIGNALS = [
  { terms: ['just started', 'just launched', 'starting my business', 'new business', 'small business', 'side hustle'], weight: 12, label: 'new business owner' },
  { terms: ['restaurant', 'café', 'cafe', 'food truck', 'catering'], weight: 10, label: 'restaurant/food business' },
  { terms: ['dentist', 'clinic', 'medical practice', 'therapy practice', 'law firm', 'attorney'], weight: 10, label: 'professional services firm' },
  { terms: ['startup', 'saas', 'mvp', 'product launch'], weight: 10, label: 'startup/SaaS venture' },
  { terms: ['freelancer', 'freelance', 'consultant', 'agency'], weight: 8, label: 'freelancer or consultant' },
  { terms: ['client', 'customers', 'portfolio', 'leads'], weight: 8, label: 'client-facing business' },
  { terms: ['real estate', 'realtor', 'property'], weight: 10, label: 'real estate business' },
  { terms: ['contractor', 'plumber', 'electrician', 'hvac', 'roofer', 'handyman'], weight: 10, label: 'home services business' },
];

const BUDGET_SIGNALS = [
  { terms: ['budget', 'affordable', 'cheap', 'quote', 'pricing', 'how much does', 'cost to build'], weight: 8, label: 'actively looking for pricing' },
  { terms: ['hire', 'outsource', 'contractor', 'freelancer for'], weight: 6, label: 'ready to hire' },
  { terms: ['pay', 'paying', 'investment', 'invest in'], weight: 5, label: 'willing to invest' },
];

const NEGATIVE_SIGNALS = [
  { terms: ['already have a website', 'already have website', 'website is live', 'website just launched'], weight: -25, label: 'already has a website' },
  { terms: ['just redesigned', 'just rebuilt', 'recently built'], weight: -20, label: 'recently built a website' },
  { terms: ['i am a developer', "i'm a developer", 'web developer myself', 'i build websites'], weight: -30, label: 'is themselves a developer' },
  { terms: ['selling my website', 'website for sale', 'domain for sale'], weight: -15, label: 'selling, not buying' },
];

// ─── Service Classifier ─────────────────────────────────────────────────────

function classifyService(text: string): string {
  const t = text.toLowerCase();
  if (/shopify|woocommerce|ecommerce|e-commerce|online store|online shop/.test(t)) return 'E-commerce Site';
  if (/landing page/.test(t)) return 'Landing Page';
  if (/portfolio/.test(t)) return 'Portfolio Website';
  if (/restaurant|cafe|café|food truck|catering/.test(t)) return 'Restaurant Website';
  if (/dentist|clinic|medical|therapy|law firm|attorney|realtor/.test(t)) return 'Professional Services Site';
  if (/startup|saas|mvp|product/.test(t)) return 'Startup / SaaS Website';
  if (/contractor|plumber|electrician|hvac|roofer|handyman/.test(t)) return 'Local Business Website';
  if (/blog/.test(t)) return 'Blog / CMS Website';
  if (/booking|appointment|reservation/.test(t)) return 'Booking-enabled Website';
  return 'Business Website';
}

// ─── Main Scorer ─────────────────────────────────────────────────────────────

export function scoreRedditPost(title: string, body: string = ''): ScoringResult {
  const combined = `${title} ${body}`.toLowerCase();
  let totalScore = 0;
  const hitLabels: string[] = [];

  const allSignals = [
    ...HIGH_INTENT_SIGNALS,
    ...BUSINESS_CONTEXT_SIGNALS,
    ...BUDGET_SIGNALS,
    ...NEGATIVE_SIGNALS,
  ];

  for (const signal of allSignals) {
    const hit = signal.terms.some(term => combined.includes(term.toLowerCase()));
    if (hit) {
      totalScore += signal.weight;
      if (signal.weight > 0) hitLabels.push(signal.label);
    }
  }

  // Clamp to 0–100
  const aiScore = Math.min(100, Math.max(0, totalScore));

  // Build human-readable reason
  let reason: string;
  if (hitLabels.length === 0) {
    reason = aiScore > 0
      ? 'Post contains weak signals of web development interest.'
      : 'No strong signals detected for web development need.';
  } else if (hitLabels.length === 1) {
    reason = `Post signals: ${hitLabels[0]}.`;
  } else {
    const last = hitLabels.pop();
    reason = `Post signals: ${hitLabels.join(', ')}, and ${last}.`;
  }

  const suggestedService = classifyService(combined);

  return { aiScore, reason, suggestedService };
}
