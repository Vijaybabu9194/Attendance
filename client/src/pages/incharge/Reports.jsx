import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { attendanceApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate, formatTime } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function InchargeReports() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadRecords(); }, [filters]);

  const loadRecords = async () => {
    setLoading(true);
    try { const res = await attendanceApi.getReport({ ...filters, limit: 100 }); setRecords(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <>
      <Topbar title="Reports" subtitle="Attendance reports" />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <input type="date" className="form-input" style={{ width: 160, height: 40 }} value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
              <span style={{ color: '#94A3B8' }}>to</span>
              <input type="date" className="form-input" style={{ width: 160, height: 40 }} value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
            </div>
            <div className="toolbar-right"><button className="btn btn-secondary"><Download size={16} /> Export</button></div>
          </div>
          <div className="card"><div className="card-body no-padding">
            <table className="data-table">
              <thead><tr><th>Worker</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td><div className="user-info"><div className="avatar sm" style={{ background: getAvatarColor(r.worker?.name), color: '#fff' }}>{getInitials(r.worker?.name)}</div><div className="user-info-text"><h4>{r.worker?.name}</h4></div></div></td>
                    <td style={{ fontSize: 13 }}>{formatDate(r.date)}</td>
                    <td style={{ fontSize: 13 }}>{formatTime(r.checkIn)}</td>
                    <td style={{ fontSize: 13 }}>{formatTime(r.checkOut)}</td>
                    <td style={{ fontWeight: 600 }}>{r.workingHours ? `${r.workingHours.toFixed(1)}h` : '—'}</td>
                    <td><span className={`badge ${getStatusColor(r.status)}`}><span className="badge-dot"></span>{r.status}</span></td>
                  </tr>
                ))}
                {records.length === 0 && !loading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No records</td></tr>}
              </tbody>
            </table>
          </div></div>
        </motion.div>
      </div>
    </>
  );
}
