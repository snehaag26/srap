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
