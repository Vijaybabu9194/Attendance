import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, LogIn } from 'lucide-react';

const demoCredentials = [
  { label: 'Super Admin', email: 'admin@attendease.com', password: 'admin123' },
  { label: 'Incharge', email: 'incharge1@attendease.com', password: 'incharge123' },
  { label: 'Worker', email: 'worker1@attendease.com', password: 'worker123' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const routes = {
        super_admin: '/admin',
        incharge: '/incharge',
        worker: '/worker'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">A</div>
            <h1>AttendEase</h1>
            <p>Workforce Attendance Management</p>
          </div>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="login-submit"
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? (
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-demo">
            <h4>Demo Accounts</h4>
            <div className="demo-credentials">
              {demoCredentials.map(cred => (
                <div
                  key={cred.label}
                  className="demo-credential"
                  onClick={() => fillCredentials(cred)}
                  id={`demo-${cred.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span>{cred.label}</span>
                  <small>{cred.email}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
