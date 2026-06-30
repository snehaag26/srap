import React, { useMemo } from 'react';
import { BusinessLead } from '@/lib/types';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface OutreachModalProps {
  lead: BusinessLead | null;
  onClose: () => void;
}

export function OutreachAssistantModal({ lead, onClose }: OutreachModalProps) {
  const [copied, setCopied] = React.useState(false);

  const messageTemplate = useMemo(() => {
    if (!lead) return '';

    let issues = [];
    if (!lead.websiteUrl || (lead.websiteAnalysis && !lead.websiteAnalysis.exists)) {
      return `Hi there,\n\nI was looking for ${lead.name} online but couldn't find a website. In today's digital age, having a professional online presence is crucial for attracting new customers.\n\nI help businesses like yours build stunning, fast, and modern websites that drive growth. Would you be open to a quick chat about getting ${lead.name} online?\n\nBest regards,\n[Your Name]`;
    }

    const analysis = lead.websiteAnalysis;
    if (analysis) {
      if (!analysis.mobileResponsive) issues.push("isn't fully optimized for mobile devices");
      if (analysis.loadSpeedMs > 3000) issues.push("takes a bit too long to load");
      if (!analysis.modernDesign) issues.push("could benefit from a modern redesign");
      if (!analysis.sslValid) issues.push("is missing a secure SSL certificate");
    }

    let issuesText = '';
    if (issues.length === 1) {
      issuesText = issues[0];
    } else if (issues.length === 2) {
      issuesText = `${issues[0]} and ${issues[1]}`;
    } else if (issues.length > 2) {
      issuesText = `${issues.slice(0, -1).join(', ')}, and ${issues[issues.length - 1]}`;
    }

    if (issues.length === 0) {
      return `Hi there,\n\nI was checking out the website for ${lead.name} and noticed it's doing quite well! However, there's always room for growth.\n\nI specialize in advanced web optimization and conversion rate improvements. Let me know if you'd like a free audit to see how we can take your site to the next level.\n\nBest regards,\n[Your Name]`;
    }

    return `Hi there,\n\nI was checking out the website for ${lead.name} and noticed that it ${issuesText}.\n\nI help businesses improve their online presence through fast, responsive, and modern websites. I'd love to share some ideas on how we can improve your site's performance and help you attract more clients.\n\nAre you open to a brief chat this week?\n\nBest regards,\n[Your Name]`;
  }, [lead]);

  if (!lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header flex items-center justify-between">
          <h3 style={{ margin: 0 }}>Outreach Assistant</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Generated draft for <strong>{lead.name}</strong> based on their website analysis.
          </p>
          
          <div className="message-preview" style={{ 
            backgroundColor: 'var(--bg-base)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            lineHeight: 1.6
          }}>
            {messageTemplate}
          </div>
        </div>
        
        <div className="modal-footer flex items-center justify-between" style={{ 
          padding: '1rem 1.5rem', 
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
