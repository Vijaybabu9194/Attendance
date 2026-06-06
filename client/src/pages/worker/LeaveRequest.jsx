import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { leaveApi } from '../../lib/api';
import { getStatusColor, formatDate } from '../../lib/utils';

export default function LeaveRequest() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', type: 'casual', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadLeaves(); }, []);

  const loadLeaves = async () => {
    try { const res = await leaveApi.getAll({ limit: 20 }); setLeaves(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveApi.create(form);
      setShowForm(false);
      setForm({ startDate: '', endDate: '', type: 'casual', reason: '' });
      loadLeaves();
    } catch (err) { alert(err.message || 'Error submitting leave'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mobile-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Leave Requests</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {/* New Leave Form */}
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-input form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="earned">Earned Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="personal">Personal Leave</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Reason</label><textarea className="form-input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Enter reason for leave..." rows={3} required /></div>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Leave History */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {leaves.map(l => (
              <div key={l._id} style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="badge primary" style={{ textTransform: 'capitalize', fontSize: 11 }}>{l.type}</span>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{l.totalDays} day{l.totalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{formatDate(l.startDate)} → {formatDate(l.endDate)}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{l.reason}</div>
                  </div>
                  <span className={`badge ${getStatusColor(l.status)}`}><span className="badge-dot"></span>{l.status}</span>
                </div>
                {l.rejectionReason && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>Reason: {l.rejectionReason}</div>}
              </div>
            ))}
            {leaves.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No leave requests yet</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
