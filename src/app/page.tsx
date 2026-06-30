'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsCards } from '@/components/AnalyticsCards';
import { FilterPanel } from '@/components/FilterPanel';
import { LeadTable } from '@/components/LeadTable';
import { OutreachAssistantModal } from '@/components/OutreachAssistantModal';
import { SearchForm } from '@/components/SearchForm';
import { exportLeadsToCSV } from '@/lib/export';
import { BusinessLead } from '@/lib/types';
import { calculateLeadScore, determineLeadStatus } from '@/lib/scoring';

// Helper to simulate deep website analysis since Google Places API doesn't provide this.
function simulateWebsiteAnalysis(websiteUri?: string) {
  if (!websiteUri) return null;
  // Deterministic simulation based on URL length just to show varied data
  const len = websiteUri.length;
  return {
    exists: true,
    mobileResponsive: len % 2 === 0,
    sslValid: websiteUri.startsWith('https'),
    loadSpeedMs: 1000 + (len * 100),
    modernDesign: len % 3 === 0,
    hasContactForm: len % 4 !== 0,
    hasSocialLinks: len % 5 !== 0
  };
}

export default function Dashboard() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async ({ category, city, country }: { category: string, city: string, country: string }) => {
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, city, country })
      });
      
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error('Received an invalid response from the server.');
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch places');
      }

      const rawPlaces = data.places || [];
      const newLeads: BusinessLead[] = rawPlaces.map((place: any) => {
        const websiteUri = place.website || null;
        const analysis = websiteUri ? simulateWebsiteAnalysis(websiteUri) : null;
        const score = calculateLeadScore(analysis);
        const status = determineLeadStatus(score);

        return {
          id: place.id,
          name: place.name || 'Unknown Business',
          category: place.category || category,
          location: city,
          websiteUrl: websiteUri,
          phone: place.phone || 'N/A',
          address: place.address || 'Unknown Address',
          rating: place.rating || 0,
          reviewCount: place.reviewCount || 0,
          websiteAnalysis: analysis,
          score,
          status
        };
      });

      setLeads(newLeads);
      // Reset filters when new search happens
      setSelectedCategory('');
      setMinScore(0);
      setMinRating(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(leads.map(l => l.category));
    return Array.from(cats).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (selectedCategory && lead.category !== selectedCategory) return false;
      if (lead.score < minScore) return false;
      if (lead.rating < minRating) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [leads, selectedCategory, minScore, minRating]);

  const handleExport = () => {
    exportLeadsToCSV(filteredLeads);
  };

  return (
    <>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Lead Generation Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Find and analyze businesses that need your web development services.</p>
        </div>
      </div>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', marginBottom: '2rem' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {leads.length > 0 && (
        <>
          <AnalyticsCards leads={filteredLeads} />
          
          <FilterPanel 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minScore={minScore}
            onScoreChange={setMinScore}
            minRating={minRating}
            onRatingChange={setMinRating}
            onExport={handleExport}
          />

          <LeadTable 
            leads={filteredLeads} 
            onOpenOutreach={setSelectedLead} 
          />
        </>
      )}

      {selectedLead && (
        <OutreachAssistantModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}
    </>
  );
}
