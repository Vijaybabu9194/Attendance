import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { dashboardApi, attendanceApi, leaveApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatTime } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function InchargeDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      attendanceApi.getToday(),
      leaveApi.getAll({ status: 'pending', limit: 5 })
    ]).then(([s, a, l]) => {
      setStats(s.data);
      setTodayAttendance(a.data);
      setPendingLeaves(l.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (<><Topbar title="Dashboard" /><div className="page-content"><div className="loading-screen"><div className="spinner spinner-lg"></div></div></div></>);

  const cards = [
    { label: 'Assigned Workers', value: stats?.assignedWorkers || 0, icon: Users, color: 'blue' },
    { label: 'Present Today', value: stats?.presentToday || 0, icon: CheckCircle2, color: 'green' },
    { label: 'Absent Today', value: stats?.absentToday || 0, icon: XCircle, color: 'red' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: Clock, color: 'yellow' },
  ];

  return (
    <>
      <Topbar title="Incharge Dashboard" subtitle="Overview" />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {cards.map(c => (
              <div className="stat-card" key={c.label}>
                <div className={`stat-icon ${c.color}`}><c.icon /></div>
                <div className="stat-info"><h3>{c.label}</h3><div className="stat-value">{c.value}</div></div>
              </div>
            ))}
          </div>

          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><h3 className="card-title">📋 Today's Attendance</h3><span className="badge primary">{todayAttendance.length} checked in</span></div>
              <div className="card-body no-padding">
                <table className="data-table">
                  <thead><tr><th>Worker</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
                  <tbody>
                    {todayAttendance.map(a => (
                      <tr key={a._id}>
                        <td><div className="user-info"><div className="avatar sm" style={{ background: getAvatarColor(a.worker?.name), color: '#fff' }}>{getInitials(a.worker?.name)}</div><div className="user-info-text"><h4>{a.worker?.name}</h4></div></div></td>
                        <td style={{ fontSize: 13 }}>{formatTime(a.checkIn)}</td>
                        <td style={{ fontSize: 13 }}>{formatTime(a.checkOut)}</td>
                        <td style={{ fontWeight: 600 }}>{a.workingHours ? `${a.workingHours.toFixed(1)}h` : '—'}</td>
                        <td><span className={`badge ${getStatusColor(a.status)}`}><span className="badge-dot"></span>{a.status}</span></td>
                      </tr>
                    ))}
                    {todayAttendance.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No attendance records yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 className="card-title">🕐 Pending Leave Requests</h3></div>
              <div className="card-body no-padding">
                <table className="data-table">
                  <thead><tr><th>Worker</th><th>Type</th><th>Days</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingLeaves.map(l => (
                      <tr key={l._id}>
                        <td><div className="user-info"><div className="avatar sm" style={{ background: getAvatarColor(l.worker?.name), color: '#fff' }}>{getInitials(l.worker?.name)}</div><div className="user-info-text"><h4>{l.worker?.name}</h4></div></div></td>
                        <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                        <td style={{ fontWeight: 600 }}>{l.totalDays}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-success btn-sm" onClick={() => leaveApi.approve(l._id).then(() => window.location.reload())}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => leaveApi.reject(l._id, 'Denied').then(() => window.location.reload())}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingLeaves.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No pending requests</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
