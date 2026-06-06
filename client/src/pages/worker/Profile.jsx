import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';
import { getInitials, getAvatarColor, formatDate } from '../../lib/utils';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, LogOut } from 'lucide-react';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMe().then(r => setProfile(r.user)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mobile-content"><div className="loading-screen"><div className="spinner spinner-lg"></div></div></div>;

  const u = profile || authUser;

  return (
    <div className="mobile-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="avatar xl" style={{ background: getAvatarColor(u?.name), color: '#fff', margin: '0 auto 12px', fontSize: 28 }}>
            {getInitials(u?.name)}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{u?.name}</h2>
          <span className="badge primary" style={{ marginTop: 4 }}>{u?.employeeId}</span>
        </div>

        {/* Info Card */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { icon: Mail, label: 'Email', value: u?.email },
              { icon: Phone, label: 'Phone', value: u?.phone },
              { icon: Briefcase, label: 'Category', value: u?.category },
              { icon: Briefcase, label: 'Designation', value: u?.designation || '—' },

              { icon: User, label: 'Supervisor', value: u?.supervisor?.name || '—' },
              { icon: Calendar, label: 'Joined', value: formatDate(u?.joinDate) },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div className="stat-icon blue" style={{ width: 36, height: 36, borderRadius: 8 }}>
                  <item.icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="btn btn-danger" style={{ width: '100%' }} onClick={logout}>
          <LogOut size={18} /> Sign Out
        </button>
      </motion.div>
    </div>
  );
}
