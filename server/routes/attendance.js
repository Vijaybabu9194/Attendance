const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Geofencing constants for Prasad Seeds Pvt Ltd
const TARGET_LAT = 16.8391703;
const TARGET_LNG = 81.0050689;
const RADIUS_METERS = 200;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// POST /api/attendance/check-in
router.post('/check-in', protect, authorize('worker'), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'GPS coordinates are required' });
    }

    const distance = calculateDistance(lat, lng, TARGET_LAT, TARGET_LNG);
    if (distance > RADIUS_METERS) {
      return res.status(400).json({
        success: false,
        message: `You are not at the designated check-in location (Prasad Seeds Pvt Ltd). Distance: ${Math.round(distance)}m. Allowed radius: ${RADIUS_METERS}m.`
      });
    }

    const worker = await User.findById(req.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({ worker: req.user.id, date: today });
    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (!attendance) {
      attendance = new Attendance({
        worker: req.user.id,
        date: today
      });
    }

    attendance.checkIn = new Date();
    attendance.checkInLocation = { lat, lng };
    attendance.status = 'present';
    attendance.markedBy = 'gps';

    await attendance.save();

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/check-out
router.post('/check-out', protect, authorize('worker'), async (req, res, next) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'GPS coordinates are required' });
    }

    const distance = calculateDistance(lat, lng, TARGET_LAT, TARGET_LNG);
    if (distance > RADIUS_METERS) {
      return res.status(400).json({
        success: false,
        message: `You are not at the designated check-out location (Prasad Seeds Pvt Ltd). Distance: ${Math.round(distance)}m. Allowed radius: ${RADIUS_METERS}m.`
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ worker: req.user.id, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'You have not checked in today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    attendance.checkOutLocation = { lat, lng };

    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/today
router.get('/today', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = { date: today };

    if (req.user.role === 'worker') {
      query.worker = req.user.id;
    } else if (req.user.role === 'incharge') {
      const workers = await User.find({ supervisor: req.user.id, role: 'worker' }).select('_id');
      query.worker = { $in: workers.map(w => w._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('worker', 'name employeeId category phone')
      .sort({ checkIn: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/report
router.get('/report', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    const { startDate, endDate, worker, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (worker) query.worker = worker;
    if (status) query.status = status;

    if (req.user.role === 'incharge') {
      const workers = await User.find({ supervisor: req.user.id, role: 'worker' }).select('_id');
      if (query.worker && !workers.some(w => w._id.toString() === query.worker)) {
         return res.status(403).json({ success: false, message: 'Not authorized for this worker' });
      }
      if (!query.worker) {
         query.worker = { $in: workers.map(w => w._id) };
      }
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('worker', 'name employeeId category phone')
      .sort({ date: -1, checkIn: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: records,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance/worker/:id
router.get('/worker/:id', protect, async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { worker: req.params.id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 });

    // Calculate summary
    const totalDays = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const halfDay = records.filter(r => r.status === 'half-day').length;
    const leave = records.filter(r => r.status === 'leave').length;
    const avgHours = totalDays > 0 ? records.reduce((sum, r) => sum + (r.workingHours || 0), 0) / totalDays : 0;

    res.status(200).json({
      success: true,
      data: records,
      summary: { totalDays, present, absent, halfDay, leave, avgHours: Math.round(avgHours * 10) / 10 }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/bulk-mark
router.post('/bulk-mark', protect, authorize('incharge', 'super_admin'), async (req, res, next) => {
  try {
    const { date, records } = req.body;
    // records: [{ workerId, status }]
    const bulkDate = new Date(date);
    bulkDate.setHours(0, 0, 0, 0);

    const results = await Promise.all(
      records.map(async ({ workerId, status }) => {
        return Attendance.findOneAndUpdate(
          { worker: workerId, date: bulkDate },
          {
            worker: workerId,
            date: bulkDate,
            status,
            markedBy: 'incharge'
          },
          { upsert: true, new: true }
        );
      })
    );

    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
