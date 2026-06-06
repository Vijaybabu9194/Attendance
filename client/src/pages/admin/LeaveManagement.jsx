import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon, Search } from 'lucide-react';
import { leaveApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { loadLeaves(); }, [statusFilter, typeFilter]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAll({ status: statusFilter, type: typeFilter, limit: 50 });
      setLeaves(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await leaveApi.approve(id); loadLeaves(); } catch (err) { alert(err.message); }
  };

  const handleReject = async () => {
    try {
      await leaveApi.reject(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      loadLeaves();
    } catch (err) { alert(err.message); }
  };

  const pending = leaves.filter(l => l.status === 'pending').length;

  return (
    <>
      <Topbar title="Leave Management" subtitle={`${pending} pending requests`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="earned">Earned</option>
                <option value="emergency">Emergency</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>

          <div className="card">
            <div className="card-body no-padding">
              <table className="data-table">
                <thead>
                  <tr><th>Worker</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {leaves.map(l => (
                    <tr key={l._id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar sm" style={{ background: getAvatarColor(l.worker?.name), color: '#fff' }}>{getInitials(l.worker?.name)}</div>
                          <div className="user-info-text"><h4>{l.worker?.name}</h4><span>{l.worker?.employeeId}</span></div>
                        </div>
                      </td>
                      <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                      <td style={{ fontSize: 13 }}>{formatDate(l.startDate)}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(l.endDate)}</td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{l.totalDays}</td>
                      <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                      <td><span className={`badge ${getStatusColor(l.status)}`}><span className="badge-dot"></span>{l.status}</span></td>
                      <td>
                        {l.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(l._id)}><Check size={14} /> Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setRejectId(l._id)}><XIcon size={14} /> Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>{l.approvedBy?.name || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && !loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No leave requests</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {rejectId && (
          <div className="modal-overlay" onClick={() => setRejectId(null)}>
            <motion.div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="modal-header"><h2>Reject Leave</h2><button className="modal-close" onClick={() => setRejectId(null)}><XIcon size={18} /></button></div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea className="form-input" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason..." rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRejectId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleReject}>Reject Leave</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
