import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LogIn, LogOut, CheckCircle, Navigation, Info, AlertTriangle } from 'lucide-react';
import { attendanceApi } from '../../lib/api';
import { formatTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Geofencing constants for Prasad Seeds Pvt Ltd
const TARGET_LAT = 16.8391703;
const TARGET_LNG = 81.0050689;
const RADIUS_METERS = 200;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

export default function GPSAttendance() {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState('');
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    // Load today's attendance
    attendanceApi.getToday().then(r => {
      const myRecord = r.data.find(a => true); // Worker gets only their record
      setTodayRecord(myRecord || null);
    }).catch(console.error).finally(() => setLoading(false));

    // Get location and watch changes
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocError('');
        },
        (err) => {
          console.error(err);
          setLocError('Location access denied. Please enable GPS.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocError('Geolocation not supported');
    }
  }, []);

  // Initialize and update map
  useEffect(() => {
    if (!window.L || !location || !mapRef.current) return;

    if (!leafletMap.current) {
      // Create Leaflet map centered at user location
      leafletMap.current = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([location.lat, location.lng], 16);

      // Add elegant map tile style (Voyager style)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(leafletMap.current);

      // Add Zoom buttons on the bottom right
      window.L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      // Target location (Prasad Seeds Pvt Ltd) Marker
      const targetIcon = window.L.divIcon({
        className: 'custom-target-marker',
        html: `<div class="target-marker-pulse"></div><div class="target-marker-dot"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      window.L.marker([TARGET_LAT, TARGET_LNG], { icon: targetIcon })
        .addTo(leafletMap.current)
        .bindPopup('<b>Prasad Seeds Pvt Ltd</b><br/>Designated Worksite')
        .openPopup();

      // Geofence circle
      window.L.circle([TARGET_LAT, TARGET_LNG], {
        color: '#6366F1',
        fillColor: '#6366F1',
        fillOpacity: 0.12,
        radius: RADIUS_METERS,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(leafletMap.current);
    }

    // User location pulsing marker
    const userIcon = window.L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      userMarkerRef.current = window.L.marker([location.lat, location.lng], { icon: userIcon })
        .addTo(leafletMap.current)
        .bindPopup('<b>Your Current Location</b>')
        .openPopup();
    }

    // Fit map bounds to show both user and target worksite
    const bounds = window.L.latLngBounds([[location.lat, location.lng], [TARGET_LAT, TARGET_LNG]]);
    leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });

  }, [location]);

  const distance = location
    ? calculateDistance(location.lat, location.lng, TARGET_LAT, TARGET_LNG)
    : null;
  const isWithinRange = distance !== null && distance <= RADIUS_METERS;

  const handleCheckIn = async () => {
    if (!location || !isWithinRange) return;
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
    if (!location || !isWithinRange) return;
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
        {/* Map Wrapper Card */}
        <div className="map-wrapper shadow-md">
          <div ref={mapRef} className="map-container" style={{ height: '240px', width: '100%', borderRadius: '16px' }}></div>
          {location && (
            <div className="map-coordinate-overlay">
              <Navigation size={10} className="coordinate-icon" />
              <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
            </div>
          )}
        </div>

        {/* Location Status Alerts and Geofence status */}
        {locError ? (
          <div className="status-banner error animate-pulse">
            <AlertTriangle size={16} />
            <span>{locError}</span>
          </div>
        ) : location ? (
          <div className={`geofence-status-card ${isWithinRange ? 'within' : 'outside'} shadow-sm`}>
            <div className="status-header">
              <MapPin className="pin-icon" size={18} />
              <div className="worksite-details">
                <h4>Prasad Seeds Pvt Ltd</h4>
                <p>Authorized Worksite</p>
              </div>
              <span className={`badge ${isWithinRange ? 'success' : 'danger'}`}>
                {isWithinRange ? 'In Range' : 'Out of Range'}
              </span>
            </div>
            
            <div className="status-divider"></div>
            
            <div className="status-body">
              <div className="metric">
                <span className="label">Current Distance</span>
                <span className="value">
                  {distance < 1000 ? `${Math.round(distance)} meters` : `${(distance / 1000).toFixed(2)} km`}
                </span>
              </div>
              <div className="metric">
                <span className="label">Required Radius</span>
                <span className="value">{RADIUS_METERS} meters</span>
              </div>
            </div>

            {!isWithinRange && (
              <div className="status-warning">
                <Info size={14} />
                <span>You must be within {RADIUS_METERS}m of the worksite to check in/out.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="status-banner warning animate-pulse">
            <div className="spinner-sm"></div>
            <span>Acquiring high-accuracy GPS coordinates...</span>
          </div>
        )}

        {/* GPS Button Section */}
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
                  <CheckCircle size={48} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#22C55E', marginTop: 12 }}>
                  {isCheckedOut ? 'Checked Out!' : 'Checked In!'}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>
                  Attendance recorded successfully
                </p>
              </motion.div>
            ) : (
              <motion.div key="button" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                {!todayRecord?.checkIn ? (
                  /* Check In Button */
                  <button
                    className={`gps-button check-in ${(!location || checking || !isWithinRange) ? 'disabled' : ''}`}
                    onClick={handleCheckIn}
                    disabled={!location || checking || !isWithinRange}
                  >
                    {location && isWithinRange && <div className="gps-pulse" style={{ color: '#10B981' }}></div>}
                    <LogIn size={36} />
                    <span>{checking ? 'Checking...' : 'CHECK IN'}</span>
                  </button>
                ) : isCheckedIn ? (
                  /* Check Out Button */
                  <button
                    className={`gps-button check-out ${(!location || checking || !isWithinRange) ? 'disabled' : ''}`}
                    onClick={handleCheckOut}
                    disabled={!location || checking || !isWithinRange}
                  >
                    {location && isWithinRange && <div className="gps-pulse" style={{ color: '#EF4444' }}></div>}
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
          <div className="card" style={{ marginTop: 24 }}>
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
                    {todayRecord.workingHours ? `${todayRecord.workingHours.toFixed(2)}h` : '—'}
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
