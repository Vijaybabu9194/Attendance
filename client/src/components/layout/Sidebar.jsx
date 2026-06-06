import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/utils';
import {
  LayoutDashboard, MapPin, UserCheck, Users, ClipboardList,
  FileText, BarChart3, Settings, LogOut, CalendarDays
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/incharges', icon: UserCheck, label: 'Incharges' },
  { to: '/admin/workers', icon: Users, label: 'Workers' },
  { to: '/admin/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/admin/leaves', icon: CalendarDays, label: 'Leave Requests' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const inchargeLinks = [
  { to: '/incharge', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/incharge/workers', icon: Users, label: 'My Workers' },
  { to: '/incharge/attendance', icon: ClipboardList, label: 'Attendance' },
  { to: '/incharge/leaves', icon: CalendarDays, label: 'Leave Approvals' },
  { to: '/incharge/reports', icon: FileText, label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'super_admin' ? adminLinks : inchargeLinks;
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Incharge';

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">A</div>
        <div>
          <h1>AttendEase</h1>
          <span>{roleLabel}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main Menu</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <link.icon />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.email}</div>
          </div>
        </div>
        <button
          className="sidebar-link"
          onClick={logout}
          style={{ marginTop: 8, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
          id="logout-btn"
        >
          <LogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
