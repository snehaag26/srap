import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (searchParams: { category: string; city: string; country: string }) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !city.trim()) return;
    onSearch({ category, city, country });
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Find New Leads</h2>
      <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
        <div className="flex-1" style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Business Category *
          </label>
          <input 
            type="text" 
            className="input-base" 
            placeholder="e.g. Dentist, Restaurant, Plumber" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex-1" style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            City *
          </label>
          <input 
            type="text" 
            className="input-base" 
            placeholder="e.g. New York, Austin" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex-1" style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Country (Optional)
          </label>
          <input 
            type="text" 
            className="input-base" 
            placeholder="e.g. US, UK" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ height: '42px', padding: '0 1.5rem' }}
          disabled={isLoading || !category.trim() || !city.trim()}
        >
          {isLoading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
          Search Leads
        </button>
      </form>
    </div>
  );
}
