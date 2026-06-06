import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, X } from 'lucide-react';
import { userApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function MyWorkers() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'unskilled', dailyWage: '600', designation: 'Helper' });

  useEffect(() => { loadWorkers(); }, []);
  useEffect(() => { const t = setTimeout(loadWorkers, 300); return () => clearTimeout(t); }, [search]);

  const loadWorkers = async () => {
    try { const res = await userApi.getAll({ role: 'worker', search, limit: 50 }); setWorkers(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '', category: 'unskilled', dailyWage: '600', designation: 'Helper' }); setShowModal(true); };
  const openEdit = (w) => { setEditing(w); setForm({ name: w.name, email: w.email, phone: w.phone, category: w.category, dailyWage: w.dailyWage || '', designation: w.designation || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, role: 'worker', dailyWage: parseFloat(form.dailyWage) || 0 };

      if (editing) await userApi.update(editing._id, data); else await userApi.create(data);
      setShowModal(false); loadWorkers();
    } catch (err) { alert(err.message || 'Error'); }
  };

  return (
    <>
      <Topbar title="My Workers" subtitle={`${workers.length} workers under your supervision`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="toolbar">
            <div className="toolbar-left"><div className="search-input"><Search /><input placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
            <div className="toolbar-right"><button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Worker</button></div>
          </div>
          <div className="card"><div className="card-body no-padding">
            <table className="data-table">
              <thead><tr><th>Worker</th><th>ID</th><th>Category</th><th>Phone</th><th>Daily Wage</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w._id}>
                    <td><div className="user-info"><div className="avatar" style={{ background: getAvatarColor(w.name), color: '#fff' }}>{getInitials(w.name)}</div><div className="user-info-text"><h4>{w.name}</h4><span>{w.designation}</span></div></div></td>
                    <td><span className="badge neutral">{w.employeeId}</span></td>
                    <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{w.category}</span></td>
                    <td style={{ fontSize: 13 }}>{w.phone}</td>
                    <td style={{ fontWeight: 600 }}>₹{w.dailyWage?.toLocaleString()}</td>
                    <td><span className={`badge ${getStatusColor(w.status)}`}><span className="badge-dot"></span>{w.status}</span></td>
                    <td><button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(w)}><Edit2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        </motion.div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="modal-header"><h2>{editing ? 'Edit Worker' : 'Add Worker'}</h2><button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button></div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Category</label><select className="form-input form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="skilled">Skilled</option><option value="unskilled">Unskilled</option><option value="contractor">Contractor</option><option value="engineer">Engineer</option></select></div>
                    <div className="form-group"><label className="form-label">Daily Wage</label><input className="form-input" type="number" value={form.dailyWage} onChange={e => setForm({...form, dailyWage: e.target.value})} /></div>
                  </div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
