import { WebsiteAnalysis, LeadStatus } from './types';

export function calculateLeadScore(analysis: WebsiteAnalysis | null): number {
  if (!analysis || !analysis.exists) {
    return 100;
  }

  let score = 0;

  if (!analysis.modernDesign) score += 35;
  if (!analysis.mobileResponsive) score += 30;
  if (analysis.loadSpeedMs > 3000) score += 15;
  if (!analysis.sslValid) score += 10;
  if (!analysis.hasContactForm) score += 5;
  if (!analysis.hasSocialLinks) score += 5;

  return Math.min(score, 100);
}

export function determineLeadStatus(score: number): LeadStatus {
  if (score >= 80) return 'Hot Lead';
  if (score >= 50) return 'Warm Lead';
  return 'Low Priority';
}
