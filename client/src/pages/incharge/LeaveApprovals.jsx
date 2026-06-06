import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X as XIcon } from 'lucide-react';
import { leaveApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => { loadLeaves(); }, [tab]);

  const loadLeaves = async () => {
    setLoading(true);
    try { const res = await leaveApi.getAll({ status: tab, limit: 50 }); setLeaves(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => { await leaveApi.approve(id); loadLeaves(); };
  const handleReject = async (id) => { const reason = prompt('Rejection reason:'); if (reason) { await leaveApi.reject(id, reason); loadLeaves(); } };

  return (
    <>
      <Topbar title="Leave Approvals" />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="tab-nav">
            {['pending', 'approved', 'rejected'].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
          <div className="card"><div className="card-body no-padding">
            <table className="data-table">
              <thead><tr><th>Worker</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th>{tab === 'pending' && <th>Actions</th>}</tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    <td><div className="user-info"><div className="avatar sm" style={{ background: getAvatarColor(l.worker?.name), color: '#fff' }}>{getInitials(l.worker?.name)}</div><div className="user-info-text"><h4>{l.worker?.name}</h4></div></div></td>
                    <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                    <td style={{ fontSize: 13 }}>{formatDate(l.startDate)}</td>
                    <td style={{ fontSize: 13 }}>{formatDate(l.endDate)}</td>
                    <td style={{ fontWeight: 600 }}>{l.totalDays}</td>
                    <td style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td><span className={`badge ${getStatusColor(l.status)}`}><span className="badge-dot"></span>{l.status}</span></td>
                    {tab === 'pending' && <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(l._id)}><Check size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(l._id)}><XIcon size={14} /></button>
                      </div>
                    </td>}
                  </tr>
                ))}
                {leaves.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No {tab} leave requests</td></tr>}
              </tbody>
            </table>
          </div></div>
        </motion.div>
      </div>
    </>
  );
}
