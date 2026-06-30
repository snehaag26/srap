import React from 'react';
import { LayoutDashboard, Users, Settings, LogOut, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="sidebar flex flex-col">
      <div className="sidebar-header">
        <div className="logo-icon"><BarChart3 size={24} /></div>
        <span className="logo-text">LeadGenPro</span>
      </div>
      
      <nav className="sidebar-nav flex flex-col gap-2">
        <Link href="/" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="#" className="nav-item">
          <Users size={20} />
          <span>Leads</span>
        </Link>
        <Link href="#" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <button className="nav-item w-full" style={{ justifyContent: 'flex-start' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
