import { motion } from 'framer-motion';
import { Building2, MapPin, Clock, Bell, Shield, Globe } from 'lucide-react';
import Topbar from '../../components/layout/Topbar';

export default function Settings() {
  return (
    <>
      <Topbar title="Settings" subtitle="System configuration" />
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><h3 className="card-title"><Building2 size={18} style={{ marginRight: 8, color: '#2563EB' }} />Organization</h3></div>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" defaultValue="BuildCorp Industries Pvt Ltd" /></div>
                <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" defaultValue="admin@attendease.com" /></div>
                <div className="form-group"><label className="form-label">Contact Phone</label><input className="form-input" defaultValue="+91 9876543210" /></div>
                <button className="btn btn-primary btn-sm">Save Changes</button>
              </div>
            </div>



            <div className="card">
              <div className="card-header"><h3 className="card-title"><Clock size={18} style={{ marginRight: 8, color: '#F59E0B' }} />Working Hours</h3></div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Shift Start</label><input className="form-input" type="time" defaultValue="09:00" /></div>
                  <div className="form-group"><label className="form-label">Shift End</label><input className="form-input" type="time" defaultValue="18:00" /></div>
                </div>
                <div className="form-group"><label className="form-label">Half-Day Threshold (hours)</label><input className="form-input" type="number" defaultValue={4} /></div>
                <div className="form-group"><label className="form-label">Overtime After (hours)</label><input className="form-input" type="number" defaultValue={8} /></div>
                <button className="btn btn-primary btn-sm">Save Hours</button>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 className="card-title"><Bell size={18} style={{ marginRight: 8, color: '#7C3AED' }} />Notifications</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {['Attendance alerts', 'Leave request notifications', 'Daily summary email', 'Late check-in alerts'].map(item => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#2563EB' }} />
                      <span style={{ fontSize: 14, color: '#475569' }}>{item}</span>
                    </label>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Save Preferences</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
