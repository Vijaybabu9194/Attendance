import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { attendanceApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, [month, year]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getWorkerHistory(user.id, { month, year });
      setRecords(res.data);
      setSummary(res.summary || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const recordMap = {};
  records.forEach(r => {
    const d = new Date(r.date).getDate();
    recordMap[d] = r.status;
  });

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="mobile-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Summary Cards */}
        <div className="worker-stats" style={{ marginBottom: 16 }}>
          <div className="worker-stat-card"><div className="label">Present</div><div className="value" style={{ color: '#22C55E' }}>{summary.present || 0}</div></div>
          <div className="worker-stat-card"><div className="label">Absent</div><div className="value" style={{ color: '#EF4444' }}>{summary.absent || 0}</div></div>
          <div className="worker-stat-card"><div className="label">Half Day</div><div className="value" style={{ color: '#F59E0B' }}>{summary.halfDay || 0}</div></div>
          <div className="worker-stat-card"><div className="label">Avg Hours</div><div className="value" style={{ color: '#2563EB' }}>{summary.avgHours || 0}</div></div>
        </div>

        {/* Calendar */}
        <div className="attendance-calendar">
          <div className="calendar-header">
            <button className="btn btn-ghost btn-icon btn-sm" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{monthName}</h3>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          <div className="calendar-grid">
            {DAYS.map(d => <div key={d} className="calendar-day-label">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="calendar-day empty"></div>;
              const status = recordMap[day] || '';
              const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
              return (
                <div key={day} className={`calendar-day ${status} ${isToday ? 'today' : ''}`}>
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Present', color: '#DCFCE7' },
              { label: 'Absent', color: '#FEE2E2' },
              { label: 'Half Day', color: '#FEF3C7' },
              { label: 'Leave', color: '#CFFAFE' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }}></div>
                <span style={{ color: '#64748B' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Records List */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><h3 className="card-title" style={{ fontSize: 15 }}>📋 Attendance Log</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            {records.slice(0, 10).map(r => (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderBottom: '1px solid #F1F5F9'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{formatTime(r.checkIn)} → {formatTime(r.checkOut)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${r.status === 'present' ? 'success' : r.status === 'absent' ? 'danger' : r.status === 'half-day' ? 'warning' : 'info'}`}>
                    <span className="badge-dot"></span>{r.status}
                  </span>
                  {r.workingHours > 0 && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{r.workingHours.toFixed(1)}h</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
