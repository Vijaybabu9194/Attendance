import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, MapPin, BarChart3 } from 'lucide-react';
import { dashboardApi } from '../../lib/api';
import Topbar from '../../components/layout/Topbar';

const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#22C55E', '#EF4444', '#06B6D4'];

export default function Analytics() {
  const [trends, setTrends] = useState([]);

  const [catData, setCatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      const [t, c] = await Promise.all([
        dashboardApi.getAttendanceTrends({ days: period }),
        dashboardApi.getCategoryDistribution()
      ]);
      setTrends(t.data.map(d => ({
        ...d,
        date: new Date(d._id).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0
      })));

      setCatData(c.data.map(d => ({ name: d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Other', value: d.count })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (<><Topbar title="Analytics" /><div className="page-content"><div className="loading-screen"><div className="spinner spinner-lg"></div></div></div></>);

  return (
    <>
      <Topbar title="Analytics" subtitle="Workforce insights & trends" />
      <div className="page-content">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="tab-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
                {[7, 14, 30].map(d => (
                  <button key={d} className={`tab-btn ${period === d ? 'active' : ''}`} onClick={() => setPeriod(d)}>{d} Days</button>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>📈 Attendance Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
                  <Line type="monotone" dataKey="rate" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#2563EB' }} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </div>


          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>📊 Daily Attendance Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
                  <Area type="monotone" dataKey="present" stroke="#22C55E" fill="url(#gP)" strokeWidth={2} name="Present" />
                  <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="url(#gA)" strokeWidth={2} name="Absent" />
                  <Area type="monotone" dataKey="leave" stroke="#F59E0B" fill="url(#gL)" strokeWidth={2} name="Leave" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>👷 Workforce Composition</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {catData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
