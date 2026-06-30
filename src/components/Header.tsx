'use client';

import React from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="header flex items-center justify-between">
      <div className="header-search flex items-center">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search leads, businesses..." 
          className="search-input"
        />
      </div>
      
      <div className="header-actions flex items-center gap-4">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {!mounted ? <div style={{width: 20, height: 20}} /> : (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
        </button>
        <div className="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" alt="User Profile" />
        </div>
      </div>
    </header>
  );
}
