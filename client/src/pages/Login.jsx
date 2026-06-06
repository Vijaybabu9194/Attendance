import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Phone, Lock, UserCog } from 'lucide-react';
import { authApi } from '../lib/api';

export default function Login() {
  const [loginMode, setLoginMode] = useState('mobile'); // 'mobile' | 'admin'
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: MPIN
  const [mpinMode, setMpinMode] = useState('login'); // 'login' | 'setup'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      routeUser(user);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.checkPhone({ phone });
      setMpinMode(res.mpinSet ? 'login' : 'setup');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Phone number not eligible');
    } finally {
      setLoading(false);
    }
  };

  const handleMpinSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mpinMode === 'setup' && mpin !== confirmMpin) {
      return setError('MPINs do not match');
    }
    setLoading(true);
    try {
      let user;
      if (mpinMode === 'setup') {
        const res = await authApi.setupMpin({ phone, mpin });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.location.href = '/'; 
        return; 
      } else {
        user = await login({ phone, mpin });
        routeUser(user);
      }
    } catch (err) {
      setError(err.message || 'Invalid MPIN');
    } finally {
      setLoading(false);
    }
  };

  const routeUser = (user) => {
    const routes = {
      super_admin: '/admin',
      incharge: '/incharge',
      worker: '/worker'
    };
    navigate(routes[user.role] || '/');
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">A</div>
            <h1>AttendEase</h1>
            <p>Workforce Attendance Management</p>
          </div>

          <div className="tab-nav" style={{ marginBottom: 24, paddingBottom: 0 }}>
            <button className={`tab-btn ${loginMode === 'mobile' ? 'active' : ''}`} onClick={() => { setLoginMode('mobile'); setStep(1); setError(''); }}>Mobile Login</button>
            <button className={`tab-btn ${loginMode === 'admin' ? 'active' : ''}`} onClick={() => { setLoginMode('admin'); setError(''); }}>Admin Login</button>
          </div>

          {error && (
            <motion.div className="login-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {loginMode === 'admin' && (
            <form className="login-form" onSubmit={handleAdminSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><UserCog size={18} /> Sign In as Admin</>}
              </button>
            </form>
          )}

          {loginMode === 'mobile' && step === 1 && (
            <form className="login-form" onSubmit={handlePhoneSubmit}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="search-input" style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '0 12px' }}>
                  <Phone size={18} style={{ color: '#94A3B8' }} />
                  <input type="tel" placeholder="Enter your 10-digit mobile number" style={{ border: 'none', outline: 'none', width: '100%', height: 44, marginLeft: 8 }} value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : 'Continue'}
              </button>
            </form>
          )}

          {loginMode === 'mobile' && step === 2 && (
            <form className="login-form" onSubmit={handleMpinSubmit}>
              <div className="form-group">
                <label className="form-label">{mpinMode === 'setup' ? 'Set 4-Digit MPIN' : 'Enter 4-Digit MPIN'}</label>
                <div className="search-input" style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '0 12px' }}>
                  <Lock size={18} style={{ color: '#94A3B8' }} />
                  <input type="password" maxLength={4} pattern="\d{4}" placeholder="••••" style={{ border: 'none', outline: 'none', width: '100%', height: 44, marginLeft: 8, letterSpacing: 8, fontSize: 20 }} value={mpin} onChange={e => setMpin(e.target.value)} required />
                </div>
              </div>

              {mpinMode === 'setup' && (
                <div className="form-group">
                  <label className="form-label">Confirm MPIN</label>
                  <div className="search-input" style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '0 12px' }}>
                    <Lock size={18} style={{ color: '#94A3B8' }} />
                    <input type="password" maxLength={4} pattern="\d{4}" placeholder="••••" style={{ border: 'none', outline: 'none', width: '100%', height: 44, marginLeft: 8, letterSpacing: 8, fontSize: 20 }} value={confirmMpin} onChange={e => setConfirmMpin(e.target.value)} required />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 2 }}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : (mpinMode === 'setup' ? 'Set MPIN & Login' : 'Login')}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
