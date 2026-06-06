import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Download, Filter, X } from 'lucide-react';
import { userApi } from '../../lib/api';
import { getInitials, getAvatarColor, getStatusColor, formatDate } from '../../lib/utils';
import Topbar from '../../components/layout/Topbar';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [incharges, setIncharges] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', category: 'unskilled',
    supervisor: '', dailyWage: '', designation: ''
  });

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { loadWorkers(); }, [page, categoryFilter, statusFilter]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); loadWorkers(); }, 300); return () => clearTimeout(t); }, [search]);

  const loadMeta = async () => {
    try {
      const icRes = await userApi.getIncharges();
      setIncharges(icRes.data);
    } catch (err) { console.error(err); }
  };

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll({
        role: 'worker', search, page, limit: 15,
        ...(statusFilter && { status: statusFilter })
      });
      let data = res.data;
      if (categoryFilter) data = data.filter(w => w.category === categoryFilter);
      setWorkers(data);
      setTotal(res.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', category: 'unskilled', supervisor: '', dailyWage: '600', designation: 'Helper' });
    setShowModal(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({ name: w.name, email: w.email, phone: w.phone, category: w.category, supervisor: w.supervisor?._id || '', dailyWage: w.dailyWage || '', designation: w.designation || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, role: 'worker', dailyWage: parseFloat(form.dailyWage) || 0 };

      if (editing) { await userApi.update(editing._id, data); }
      else { await userApi.create(data); }
      setShowModal(false);
      loadWorkers();
    } catch (err) { alert(err.message || 'Error'); }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <>
      <Topbar title="Worker Management" subtitle={`${total} workers`} />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-input"><Search /><input placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} /></div>
              <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="skilled">Skilled</option>
                <option value="unskilled">Unskilled</option>
                <option value="contractor">Contractor</option>
                <option value="engineer">Engineer</option>
              </select>
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="toolbar-right">
              <button className="btn btn-secondary"><Download size={16} /> Export</button>
              <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Add Worker</button>
            </div>
          </div>

          <div className="card">
            <div className="card-body no-padding">
              <table className="data-table" id="workers-table">
                <thead>
                  <tr>
                    <th>Worker</th><th>Employee ID</th><th>Category</th>
                    <th>Supervisor</th><th>Daily Wage</th><th>Joined</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w._id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar" style={{ background: getAvatarColor(w.name), color: '#fff' }}>{getInitials(w.name)}</div>
                          <div className="user-info-text">
                            <h4>{w.name}</h4>
                            <span>{w.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge neutral">{w.employeeId}</span></td>
                      <td><span className="badge primary" style={{ textTransform: 'capitalize' }}>{w.category}</span></td>
                      <td style={{ fontSize: 13 }}>{w.supervisor?.name || '—'}</td>
                      <td style={{ fontWeight: 600 }}>₹{w.dailyWage?.toLocaleString() || 0}</td>
                      <td style={{ fontSize: 13 }}>{formatDate(w.joinDate)}</td>
                      <td><span className={`badge ${getStatusColor(w.status)}`}><span className="badge-dot"></span>{w.status}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(w)}><Edit2 size={15} /></button>
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && !loading && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No workers found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Showing {(page-1)*15 + 1}–{Math.min(page*15, total)} of {total}</span>
              <div className="pagination-buttons">
                <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button key={i+1} className={`pagination-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </motion.div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Worker' : 'Add New Worker'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-input form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        <option value="skilled">Skilled</option><option value="unskilled">Unskilled</option>
                        <option value="contractor">Contractor</option><option value="engineer">Engineer</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Daily Wage (₹)</label><input className="form-input" type="number" value={form.dailyWage} onChange={e => setForm({...form, dailyWage: e.target.value})} /></div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Supervisor</label>
                      <select className="form-input form-select" value={form.supervisor} onChange={e => setForm({...form, supervisor: e.target.value})}>
                        <option value="">Select supervisor...</option>
                        {incharges.map(ic => <option key={ic._id} value={ic._id}>{ic.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Designation</label><input className="form-input" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
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
