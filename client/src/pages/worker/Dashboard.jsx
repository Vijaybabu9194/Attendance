import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../lib/api';
import { formatTime } from '../../lib/utils';
import { Clock, MapPin, CheckCircle2, Percent, Calendar, Bell } from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mobile-content"><div className="loading-screen"><div className="spinner spinner-lg"></div></div></div>;

  const statusLabel = stats?.todayStatus === 'present' ? '✅ Present' : stats?.todayStatus === 'half-day' ? '⚡ Half Day' : '❌ Not Checked In';
  const statusColor = stats?.todayStatus === 'present' ? '#22C55E' : stats?.todayStatus === 'half-day' ? '#F59E0B' : '#94A3B8';

  return (
    <div className="mobile-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Today's Status Card */}
        <motion.div
          style={{
            background: `linear-gradient(135deg, ${statusColor}20, ${statusColor}08)`,
            border: `1px solid ${statusColor}40`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            textAlign: 'center'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div style={{ fontSize: 14, color: '#475569', fontWeight: 500, marginBottom: 4 }}>Today's Status</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
        </motion.div>

        {/* Stats Grid */}
        <div className="worker-stats">
          <motion.div className="worker-stat-card" whileHover={{ scale: 1.02 }}>
            <Clock size={20} color="#2563EB" style={{ marginBottom: 4 }} />
            <div className="label">Check In</div>
            <div className="value" style={{ fontSize: 18 }}>{formatTime(stats?.checkInTime)}</div>
          </motion.div>
          <motion.div className="worker-stat-card" whileHover={{ scale: 1.02 }}>
            <Clock size={20} color="#EF4444" style={{ marginBottom: 4 }} />
            <div className="label">Check Out</div>
            <div className="value" style={{ fontSize: 18 }}>{formatTime(stats?.checkOutTime)}</div>
          </motion.div>
          <motion.div className="worker-stat-card" whileHover={{ scale: 1.02 }}>
            <MapPin size={20} color="#F59E0B" style={{ marginBottom: 4 }} />
            <div className="label">Hours Worked</div>
            <div className="value" style={{ fontSize: 18 }}>{stats?.workingHours ? `${stats.workingHours.toFixed(1)}h` : '—'}</div>
          </motion.div>
          <motion.div className="worker-stat-card highlight" whileHover={{ scale: 1.02 }}>
            <Percent size={20} color="white" style={{ marginBottom: 4 }} />
            <div className="label">Attendance</div>
            <div className="value" style={{ fontSize: 18 }}>{stats?.attendancePercentage || 0}%</div>
          </motion.div>
        </div>

        {/* Monthly Summary */}
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: 15 }}>📊 This Month</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#22C55E' }}>{stats?.presentDays || 0}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Present</div>
              </div>
              <div style={{ width: 1, background: '#E2E8F0' }}></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>{(stats?.totalDays || 0) - (stats?.presentDays || 0)}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Absent</div>
              </div>
              <div style={{ width: 1, background: '#E2E8F0' }}></div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{stats?.totalDays || 0}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Total Days</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
