import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, MapPin, Calendar, FileText, User, 
  LayoutDashboard, Users, ClipboardList, CalendarDays, 
  Menu, UserCheck, BarChart3, Settings, LogOut, X 
} from 'lucide-react';

const workerNavItems = [
  { to: '/worker', icon: Home, label: 'Home', end: true },
  { to: '/worker/attendance', icon: MapPin, label: 'Check In' },
  { to: '/worker/history', icon: Calendar, label: 'History' },
  { to: '/worker/leave', icon: FileText, label: 'Leave' },
  { to: '/worker/profile', icon: User, label: 'Profile' },
];

const inchargeNavItems = [
  { to: '/incharge', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/incharge/workers', icon: Users, label: 'Workers' },
  { to: '/incharge/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/incharge/leaves', icon: CalendarDays, label: 'Leaves' },
  { to: '/incharge/reports', icon: FileText, label: 'Reports' },
];

// Admin bottom nav items
const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/admin/workers', icon: Users, label: 'Workers' },
  { to: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/admin/leaves', icon: CalendarDays, label: 'Leaves' },
  { isMenu: true, icon: Menu, label: 'More' },
];

// Admin extra menu items
const adminMenuItems = [
  { to: '/admin/incharges', icon: UserCheck, label: 'Incharges' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  let navItems = workerNavItems;
  if (user.role === 'incharge') navItems = inchargeNavItems;
  else if (user.role === 'super_admin') navItems = adminNavItems;

  return (
    <>
      <nav className="mobile-bottom-nav" id="mobile-nav">
        {navItems.map((item, idx) => {
          if (item.isMenu) {
            return (
              <button 
                key="menu" 
                className={`mobile-nav-item ${isMenuOpen ? 'active' : ''}`}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setIsMenuOpen(true)}
              >
                <item.icon />
                <span>{item.label}</span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.to || idx}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              id={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin More Menu Overlay */}
      {isMenuOpen && user.role === 'super_admin' && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>More Options</h3>
              <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="mobile-menu-content">
              {adminMenuItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `mobile-menu-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              <div className="mobile-menu-divider"></div>
              
              <button className="mobile-menu-link text-danger" onClick={() => { logout(); setIsMenuOpen(false); }}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
