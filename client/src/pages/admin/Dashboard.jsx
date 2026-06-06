import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, MapPin, CheckCircle2, XCircle, Percent,
  TrendingUp, TrendingDown, ArrowRight, Clock, CalendarDays
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from '../../lib/api';
import { formatDate, formatTime, getInitials, getStatusColor, getAvatarColor } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#22C55E', '#EF4444', '#06B6D4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);

  const [categoryDist, setCategoryDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, trendsRes, catRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getAttendanceTrends({ days: 30 }),
        dashboardApi.getCategoryDistribution()
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data.map(d => ({
        ...d,
        date: new Date(d._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      })));

      setCategoryDist(catRes.data.map(d => ({
        name: d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Unknown',
        value: d.count
      })));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Dashboard" subtitle="Welcome back, Admin" />
        <div className="page-content">
          <div className="loading-screen">
            <div className="spinner spinner-lg"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const statCards = [
    { label: 'Total Workers', value: stats?.totalWorkers || 0, icon: Users, color: 'blue', change: '+12%', positive: true },
    { label: 'Total Incharges', value: stats?.totalIncharges || 0, icon: UserCheck, color: 'purple', change: '+3%', positive: true },

    { label: 'Present Today', value: stats?.presentToday || 0, icon: CheckCircle2, color: 'green', change: `${stats?.attendancePercentage || 0}%`, positive: true },
    { label: 'Absent Today', value: stats?.absentToday || 0, icon: XCircle, color: 'red', change: '', positive: false },
    { label: 'Attendance %', value: `${stats?.attendancePercentage || 0}%`, icon: Percent, color: 'yellow', change: '+5%', positive: true },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle={`Overview • ${formatDate(new Date())}`} />
      <div className="page-content">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Stat Cards */}
          <div className="stats-grid">
            {statCards.map((stat, i) => (
              <motion.div key={stat.label} className="stat-card" variants={itemVariants}>
                <div className={`stat-icon ${stat.color}`}>
                  <stat.icon />
                </div>
                <div className="stat-info">
                  <h3>{stat.label}</h3>
                  <div className="stat-value">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                  {stat.change && (
                    <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                      {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {stat.change}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="chart-grid">
            <motion.div className="chart-card" variants={itemVariants}>
              <h3>📈 Attendance Trends (30 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff', border: '1px solid #E2E8F0',
                      borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#22C55E" fill="url(#gradPresent)" strokeWidth={2} name="Present" />
                  <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="url(#gradAbsent)" strokeWidth={2} name="Absent" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>


          </div>

          {/* Category Distribution + Pending Leaves */}
          <div className="chart-grid">
            <motion.div className="chart-card" variants={itemVariants}>
              <h3>👷 Worker Category Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryDist.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="card" variants={itemVariants}>
              <div className="card-header">
                <h3 className="card-title">🕐 Pending Leave Requests</h3>
                <span className="badge warning">{stats?.pendingLeaves || 0} pending</span>
              </div>
              <div className="card-body no-padding">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.pendingLeavesList || []).slice(0, 5).map(leave => (
                      <tr key={leave._id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar sm" style={{ background: getAvatarColor(leave.worker?.name), color: '#fff' }}>
                              {getInitials(leave.worker?.name)}
                            </div>
                            <div className="user-info-text">
                              <h4>{leave.worker?.name}</h4>
                              <span>{leave.worker?.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{leave.type}</span></td>
                        <td style={{ fontSize: 13 }}>{formatDate(leave.startDate)}</td>
                        <td><span className={`badge ${getStatusColor(leave.status)}`}><span className="badge-dot"></span>{leave.status}</span></td>
                      </tr>
                    ))}
                    {(!stats?.pendingLeavesList || stats.pendingLeavesList.length === 0) && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>No pending requests</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Recent Tables */}
          <div className="chart-grid">
            <motion.div className="card" variants={itemVariants}>
              <div className="card-header">
                <h3 className="card-title">📋 Recent Attendance Logs</h3>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>Today</span>
              </div>
              <div className="card-body no-padding">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker</th>

                      <th>Check In</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentAttendance || []).slice(0, 8).map(att => (
                      <tr key={att._id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar sm" style={{ background: getAvatarColor(att.worker?.name), color: '#fff' }}>
                              {getInitials(att.worker?.name)}
                            </div>
                            <div className="user-info-text">
                              <h4>{att.worker?.name}</h4>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: 13 }}>{formatTime(att.checkIn)}</td>
                        <td><span className={`badge ${getStatusColor(att.status)}`}><span className="badge-dot"></span>{att.status}</span></td>
                      </tr>
                    ))}
                    {(!stats?.recentAttendance || stats.recentAttendance.length === 0) && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>No attendance yet today</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="card" variants={itemVariants}>
              <div className="card-header">
                <h3 className="card-title">🆕 Recent Worker Registrations</h3>
              </div>
              <div className="card-body no-padding">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker</th>

                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentWorkers || []).map(worker => (
                      <tr key={worker._id}>
                        <td>
                          <div className="user-info">
                            <div className="avatar sm" style={{ background: getAvatarColor(worker.name), color: '#fff' }}>
                              {getInitials(worker.name)}
                            </div>
                            <div className="user-info-text">
                              <h4>{worker.name}</h4>
                              <span>{worker.employeeId}</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: 13 }}>{formatDate(worker.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
