import { Search, Bell, Menu } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Search />
          <input type="text" placeholder="Search anything..." id="global-search" />
        </div>
        <button className="topbar-icon-btn" id="notifications-btn" aria-label="Notifications">
          <Bell />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
}
