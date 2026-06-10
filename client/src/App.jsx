import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import MobileNav from './components/layout/MobileNav';

// Pages
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import Incharges from './pages/admin/Incharges';
import Workers from './pages/admin/Workers';
import AttendanceReports from './pages/admin/AttendanceReports';
import LeaveManagement from './pages/admin/LeaveManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

// Incharge
import InchargeDashboard from './pages/incharge/Dashboard';
import MyWorkers from './pages/incharge/MyWorkers';
import InchargeAttendance from './pages/incharge/Attendance';
import LeaveApprovals from './pages/incharge/LeaveApprovals';
import InchargeReports from './pages/incharge/Reports';

// Worker
import WorkerDashboard from './pages/worker/Dashboard';
import GPSAttendance from './pages/worker/GPSAttendance';
import AttendanceHistory from './pages/worker/History';
import LeaveRequest from './pages/worker/LeaveRequest';
import Profile from './pages/worker/Profile';

// Protected Route
function ProtectedRoute({ roles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  
  return children;
}

// Mobile Layout (All Roles)
function MobileLayout() {
  const { user } = useAuth();
  return (
    <div className="mobile-layout">
      {user?.role === 'worker' && (
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14
            }}>A</div>
            <h1>AttendEase</h1>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#2563EB', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600
          }}>
            {user?.name?.charAt(0)}
          </div>
        </div>
      )}
      <Outlet />
      <MobileNav />
    </div>
  );
}

// Auto redirect after login
function RootRedirect() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const routes = { super_admin: '/admin', incharge: '/incharge', worker: '/worker' };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['super_admin']}>
              <MobileLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="incharges" element={<Incharges />} />
            <Route path="workers" element={<Workers />} />
            <Route path="attendance" element={<AttendanceReports />} />
            <Route path="leaves" element={<LeaveManagement />} />
            <Route path="reports" element={<AttendanceReports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Incharge */}
          <Route path="/incharge" element={
            <ProtectedRoute roles={['incharge']}>
              <MobileLayout />
            </ProtectedRoute>
          }>
            <Route index element={<InchargeDashboard />} />
            <Route path="workers" element={<MyWorkers />} />
            <Route path="attendance" element={<InchargeAttendance />} />
            <Route path="leaves" element={<LeaveApprovals />} />
            <Route path="reports" element={<InchargeReports />} />
          </Route>

          {/* Worker (Mobile) */}
          <Route path="/worker" element={
            <ProtectedRoute roles={['worker']}>
              <MobileLayout />
            </ProtectedRoute>
          }>
            <Route index element={<WorkerDashboard />} />
            <Route path="attendance" element={<GPSAttendance />} />
            <Route path="history" element={<AttendanceHistory />} />
            <Route path="leave" element={<LeaveRequest />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
