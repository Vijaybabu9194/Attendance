import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Calendar } from 'lucide-react';
import { attendanceApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate, formatTime } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function AttendanceReports() {
  const [records, setRecords] = useState([]);
  const [sites, setSites] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    site: '', status: ''
  });

  useEffect(() => { loadRecords(); }, [page, filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getReport({ ...filters, page, limit: 20 });
      setRecords(res.data);
      setTotal(res.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const totalPages = Math.ceil(total / 20);

  const summary = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
  };

  return (
    <>
      <Topbar title="Attendance Reports" subtitle={`${total} records`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Filters */}
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="date" className="form-input" style={{ width: 160, height: 40 }} value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <span style={{ color: '#94A3B8' }}>to</span>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="date" className="form-input" style={{ width: 160, height: 40 }} value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})} />
              </div>

              <select className="filter-select" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            <div className="toolbar-right">
              <button className="btn btn-secondary"><Download size={16} /> Export CSV</button>
            </div>
          </div>

          {/* Summary */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card"><div className="stat-icon blue"><Calendar /></div><div className="stat-info"><h3>Total Records</h3><div className="stat-value">{total}</div></div></div>
            <div className="stat-card"><div className="stat-icon green"><Calendar /></div><div className="stat-info"><h3>Present</h3><div className="stat-value">{summary.present}</div></div></div>
            <div className="stat-card"><div className="stat-icon red"><Calendar /></div><div className="stat-info"><h3>Absent</h3><div className="stat-value">{summary.absent}</div></div></div>
            <div className="stat-card"><div className="stat-icon yellow"><Calendar /></div><div className="stat-info"><h3>Half Day</h3><div className="stat-value">{summary.halfDay}</div></div></div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-body no-padding">
              <table className="data-table">
                <thead>
                  <tr><th>Worker</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Method</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar sm" style={{ background: getAvatarColor(r.worker?.name), color: '#fff' }}>{getInitials(r.worker?.name)}</div>
                          <div className="user-info-text"><h4>{r.worker?.name}</h4><span>{r.worker?.employeeId}</span></div>
                        </div>
                      </td>

                      <td style={{ fontSize: 13 }}>{formatDate(r.date)}</td>
                      <td style={{ fontSize: 13 }}>{formatTime(r.checkIn)}</td>
                      <td style={{ fontSize: 13 }}>{formatTime(r.checkOut)}</td>
                      <td style={{ fontWeight: 600 }}>{r.workingHours ? `${r.workingHours.toFixed(1)}h` : '—'}</td>
                      <td><span className="badge neutral" style={{ textTransform: 'capitalize' }}>{r.markedBy}</span></td>
                      <td><span className={`badge ${getStatusColor(r.status)}`}><span className="badge-dot"></span>{r.status}</span></td>
                    </tr>
                  ))}
                  {records.length === 0 && !loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No records found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <div className="pagination-buttons">
                <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
