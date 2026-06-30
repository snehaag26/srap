import React from 'react';
import { BusinessLead } from '@/lib/types';
import { ExternalLink, Star, Mail } from 'lucide-react';

interface LeadTableProps {
  leads: BusinessLead[];
  onOpenOutreach: (lead: BusinessLead) => void;
}

export function LeadTable({ leads, onOpenOutreach }: LeadTableProps) {
  return (
    <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Business Details</th>
            <th>Contact Info</th>
            <th>Google Rating</th>
            <th>Score & Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No leads found.</td>
            </tr>
          ) : null}
          {leads.map(lead => (
            <tr key={lead.id} className="hover-lift-row">
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{lead.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lead.category} &bull; {lead.location}</div>
                {lead.websiteUrl ? (
                  <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {lead.websiteUrl} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="badge badge-danger" style={{ marginTop: '0.25rem' }}>No Website</span>
                )}
              </td>
              <td style={{ fontSize: '0.875rem' }}>
                <div>{lead.phone}</div>
                <div style={{ color: 'var(--text-muted)' }}>{lead.address}</div>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                  <span style={{ fontWeight: 600 }}>{lead.rating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({lead.reviewCount})</span>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{lead.score}</span>
                  <span className={`badge ${
                    lead.status === 'Hot Lead' ? 'badge-success' :
                    lead.status === 'Warm Lead' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </td>
              <td>
                <button className="btn btn-outline" onClick={() => onOpenOutreach(lead)}>
                  <Mail size={16} /> Draft Outreach
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
