import React from 'react';
import { Filter, Download } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  minScore: number;
  onScoreChange: (s: number) => void;
  minRating: number;
  onRatingChange: (r: number) => void;
  onExport: () => void;
}

export function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  minScore,
  onScoreChange,
  minRating,
  onRatingChange,
  onExport
}: FilterPanelProps) {
  return (
    <div className="card flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted" />
          <span style={{ fontWeight: 600 }}>Filters</span>
        </div>
        
        <select 
          className="input-base" 
          style={{ width: 'auto' }}
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          className="input-base" 
          style={{ width: 'auto' }}
          value={minScore}
          onChange={e => onScoreChange(Number(e.target.value))}
        >
          <option value={0}>Any Score</option>
          <option value={50}>Score 50+</option>
          <option value={80}>Score 80+</option>
        </select>

        <select 
          className="input-base" 
          style={{ width: 'auto' }}
          value={minRating}
          onChange={e => onRatingChange(Number(e.target.value))}
        >
          <option value={0}>Any Rating</option>
          <option value={4}>4+ Stars</option>
          <option value={4.5}>4.5+ Stars</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={onExport}>
        <Download size={18} />
        Export CSV
      </button>
    </div>
  );
}
