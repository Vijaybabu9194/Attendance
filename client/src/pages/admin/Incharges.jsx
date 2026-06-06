import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, MapPin, X } from 'lucide-react';
import { userApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function Incharges() {
  const [incharges, setIncharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', designation: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const icRes = await userApi.getAll({ role: 'incharge', search, limit: 50 });
      setIncharges(icRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(loadData, 300); return () => clearTimeout(t); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', designation: 'Supervisor' });
    setShowModal(true);
  };

  const openEdit = (ic) => {
    setEditing(ic);
    setForm({ name: ic.name, email: ic.email, phone: ic.phone, designation: ic.designation || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, role: 'incharge', category: 'supervisor' };

      if (editing) { await userApi.update(editing._id, data); }
      else { await userApi.create(data); }
      setShowModal(false);
      loadData();
    } catch (err) { alert(err.message || 'Error'); }
  };

  return (
    <>
      <Topbar title="Incharge Management" subtitle={`${incharges.length} incharges`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-input"><Search /><input placeholder="Search incharges..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            </div>
            <div className="toolbar-right">
              <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Incharge</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body no-padding">
              <table className="data-table">
                <thead>
                  <tr><th>Incharge</th><th>Employee ID</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {incharges.map(ic => (
                    <tr key={ic._id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar" style={{ background: getAvatarColor(ic.name), color: '#fff' }}>{getInitials(ic.name)}</div>
                          <div className="user-info-text">
                            <h4>{ic.name}</h4>
                            <span>{ic.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge neutral">{ic.employeeId}</span></td>
                      <td>{ic.phone}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(ic.joinDate)}</td>
                      <td><span className={`badge ${getStatusColor(ic.status)}`}><span className="badge-dot"></span>{ic.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(ic)}><Edit2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {incharges.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No incharges found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Incharge' : 'Add New Incharge'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
