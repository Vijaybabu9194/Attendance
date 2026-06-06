import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogIn, LogOut, CheckCircle, Navigation } from 'lucide-react';
import { attendanceApi } from '../../lib/api';
import { formatTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function GPSAttendance() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);


  useEffect(() => {
    // Load today's attendance
    attendanceApi.getToday().then(r => {
      const myRecord = r.data.find(a => true); // Worker gets only their record
      setTodayRecord(myRecord || null);
    }).catch(console.error).finally(() => setLoading(false));

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setLocError('Location access denied. Please enable GPS.'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocError('Geolocation not supported');
    }
  }, []);

  const handleCheckIn = async () => {
    if (!location) return;
    setChecking(true);
    try {
      const res = await attendanceApi.checkIn(location);
      setTodayRecord(res.data);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) return;
    setChecking(true);
    try {
      const res = await attendanceApi.checkOut(location);
      setTodayRecord(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  const isCheckedIn = todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = todayRecord?.checkIn && todayRecord?.checkOut;

  return (
    <div className="mobile-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Map Placeholder */}
        <div className="map-container">
          {location && (
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'white', borderRadius: 8, padding: '6px 12px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Navigation size={12} style={{ marginRight: 4 }} />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Location Status */}
        {locError ? (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
            📍 {locError}
          </div>
        ) : location ? (
          <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
            📍 Location acquired successfully
          </div>
        ) : (
          <div style={{ background: '#FEF3C7', color: '#D97706', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
            📍 Acquiring GPS location...
          </div>
        )}

        {/* GPS Button */}
        <div className="gps-attendance-section">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <div className="success-check">
                  <CheckCircle />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#22C55E' }}>
                  {isCheckedOut ? 'Checked Out!' : 'Checked In!'}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>
                  Attendance recorded successfully
                </p>
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                {!todayRecord?.checkIn ? (
                  /* Check In Button */
                  <button
                    className="gps-button check-in"
                    onClick={handleCheckIn}
                    disabled={!location || checking}
                  >
                    <div className="gps-pulse" style={{ color: '#22C55E' }}></div>
                    <LogIn size={36} />
                    <span>{checking ? 'Checking...' : 'CHECK IN'}</span>
                  </button>
                ) : isCheckedIn ? (
                  /* Check Out Button */
                  <button
                    className="gps-button check-out"
                    onClick={handleCheckOut}
                    disabled={!location || checking}
                  >
                    <div className="gps-pulse" style={{ color: '#EF4444' }}></div>
                    <LogOut size={36} />
                    <span>{checking ? 'Checking...' : 'CHECK OUT'}</span>
                  </button>
                ) : (
                  /* Already Done */
                  <button className="gps-button checked" disabled>
                    <CheckCircle size={36} />
                    <span>COMPLETED</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>


        </div>

        {/* Today's Record */}
        {todayRecord && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: 15 }}>Today's Record</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Check In</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22C55E' }}>{formatTime(todayRecord.checkIn)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Check Out</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: todayRecord.checkOut ? '#EF4444' : '#94A3B8' }}>
                    {formatTime(todayRecord.checkOut)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Working Hours</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {todayRecord.workingHours ? `${todayRecord.workingHours.toFixed(1)}h` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Status</div>
                  <div style={{ fontSize: 18, fontWeight: 700, textTransform: 'capitalize', color: todayRecord.status === 'present' ? '#22C55E' : '#F59E0B' }}>
                    {todayRecord.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
