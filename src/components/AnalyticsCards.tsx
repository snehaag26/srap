import React, { useMemo } from 'react';
import { BusinessLead } from '@/lib/types';
import { Users, Flame, Globe2, Activity } from 'lucide-react';

interface AnalyticsCardsProps {
  leads: BusinessLead[];
}

export function AnalyticsCards({ leads }: AnalyticsCardsProps) {
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.status === 'Hot Lead').length;
    const withoutWebsite = leads.filter(l => !l.websiteUrl || (l.websiteAnalysis && !l.websiteAnalysis.exists)).length;
    const averageScore = totalLeads > 0 
      ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / totalLeads) 
      : 0;

    return { totalLeads, hotLeads, withoutWebsite, averageScore };
  }, [leads]);

  return (
    <div className="analytics-grid">
      <div className="card stat-card hover-lift">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
          <Users size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">Total Leads</p>
          <h3 className="stat-value">{stats.totalLeads}</h3>
        </div>
      </div>
      
      <div className="card stat-card hover-lift">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
          <Flame size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">Hot Leads</p>
          <h3 className="stat-value">{stats.hotLeads}</h3>
        </div>
      </div>
      
      <div className="card stat-card hover-lift">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
          <Globe2 size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">Without Website</p>
          <h3 className="stat-value">{stats.withoutWebsite}</h3>
        </div>
      </div>
      
      <div className="card stat-card hover-lift">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
          <Activity size={24} />
        </div>
        <div className="stat-content">
          <p className="stat-label">Avg Lead Score</p>
          <h3 className="stat-value">{stats.averageScore}</h3>
        </div>
      </div>
    </div>
  );
}
