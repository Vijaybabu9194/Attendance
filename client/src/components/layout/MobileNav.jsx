import { NavLink } from 'react-router-dom';
import { Home, MapPin, Calendar, FileText, User } from 'lucide-react';

const navItems = [
  { to: '/worker', icon: Home, label: 'Home', end: true },
  { to: '/worker/attendance', icon: MapPin, label: 'Check In' },
  { to: '/worker/history', icon: Calendar, label: 'History' },
  { to: '/worker/leave', icon: FileText, label: 'Leave' },
  { to: '/worker/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-bottom-nav" id="mobile-nav">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          id={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <item.icon />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
