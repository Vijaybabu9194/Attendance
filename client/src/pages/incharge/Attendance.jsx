import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { attendanceApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatTime } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function InchargeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceApi.getToday().then(r => setAttendance(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const present = attendance.filter(a => a.status === 'present' || a.status === 'half-day').length;

  return (
    <>
      <Topbar title="Daily Attendance" subtitle={`${present} present today`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card"><div className="card-body no-padding">
            <table className="data-table">
              <thead><tr><th>Worker</th><th>Category</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Method</th><th>Status</th></tr></thead>
              <tbody>
                {attendance.map(a => (
                  <tr key={a._id}>
                    <td><div className="user-info"><div className="avatar sm" style={{ background: getAvatarColor(a.worker?.name), color: '#fff' }}>{getInitials(a.worker?.name)}</div><div className="user-info-text"><h4>{a.worker?.name}</h4><span>{a.worker?.employeeId}</span></div></div></td>
                    <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{a.worker?.category}</span></td>
                    <td style={{ fontSize: 13 }}>{formatTime(a.checkIn)}</td>
                    <td style={{ fontSize: 13 }}>{formatTime(a.checkOut)}</td>
                    <td style={{ fontWeight: 600 }}>{a.workingHours ? `${a.workingHours.toFixed(1)}h` : '—'}</td>
                    <td><span className="badge neutral" style={{ textTransform: 'capitalize' }}>{a.markedBy}</span></td>
                    <td><span className={`badge ${getStatusColor(a.status)}`}><span className="badge-dot"></span>{a.status}</span></td>
                  </tr>
                ))}
                {attendance.length === 0 && !loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No attendance records</td></tr>}
              </tbody>
            </table>
          </div></div>
        </motion.div>
      </div>
    </>
  );
}
