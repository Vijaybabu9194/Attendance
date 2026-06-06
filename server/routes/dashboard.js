const express = require('express');
const router = express.Router();
const User = require('../models/User');

const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = {};

    if (req.user.role === 'super_admin') {
      const totalWorkers = await User.countDocuments({ role: 'worker', status: 'active' });
      const totalIncharges = await User.countDocuments({ role: 'incharge', status: 'active' });

      const todayAttendance = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'half-day'] } });
      const todayAbsent = totalWorkers - todayAttendance;
      const attendancePercentage = totalWorkers > 0 ? Math.round((todayAttendance / totalWorkers) * 100) : 0;
      const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });

      // Recent worker registrations
      const recentWorkers = await User.find({ role: 'worker' })
        .sort({ createdAt: -1 })
        .limit(5);

      // Recent attendance logs
      const recentAttendance = await Attendance.find({ date: today })
        .populate('worker', 'name employeeId')
        .sort({ checkIn: -1 })
        .limit(10);

      // Pending leave requests
      const pendingLeavesList = await LeaveRequest.find({ status: 'pending' })
        .populate('worker', 'name employeeId')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalWorkers,
        totalIncharges,
        presentToday: todayAttendance,
        absentToday: todayAbsent,
        attendancePercentage,
        pendingLeaves,
        recentWorkers,
        recentAttendance,
        pendingLeavesList
      };
    } else if (req.user.role === 'incharge') {
      const siteWorkers = await User.countDocuments({
        supervisor: req.user.id,
        role: 'worker',
        status: 'active'
      });
      const workerIds = (await User.find({
        supervisor: req.user.id,
        role: 'worker'
      }).select('_id')).map(w => w._id);

      const presentToday = await Attendance.countDocuments({
        date: today,
        worker: { $in: workerIds },
        status: { $in: ['present', 'half-day'] }
      });
      const pendingLeaves = await LeaveRequest.countDocuments({
        worker: { $in: workerIds },
        status: 'pending'
      });

      stats = {
        assignedWorkers: siteWorkers,
        presentToday,
        absentToday: siteWorkers - presentToday,
        pendingApprovals: pendingLeaves
      };
    } else if (req.user.role === 'worker') {
      const todayRecord = await Attendance.findOne({ worker: req.user.id, date: today });

      // Monthly stats
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyRecords = await Attendance.find({
        worker: req.user.id,
        date: { $gte: startOfMonth, $lte: today }
      });

      const totalDaysInMonth = today.getDate();
      const presentDays = monthlyRecords.filter(r => r.status === 'present' || r.status === 'half-day').length;
      const attendancePercentage = totalDaysInMonth > 0 ? Math.round((presentDays / totalDaysInMonth) * 100) : 0;

      stats = {
        todayStatus: todayRecord ? todayRecord.status : 'absent',
        checkInTime: todayRecord?.checkIn || null,
        checkOutTime: todayRecord?.checkOut || null,
        workingHours: todayRecord?.workingHours || 0,
        attendancePercentage,
        presentDays,
        totalDays: totalDaysInMonth
      };
    }

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/attendance-trends
router.get('/attendance-trends', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const query = { date: { $gte: startDate } };
    if (req.user.role === 'incharge') {
      const workers = await User.find({ supervisor: req.user.id, role: 'worker' }).select('_id');
      query.worker = { $in: workers.map(w => w._id) };
    }

    const records = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $in: ['$status', ['present', 'half-day']] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});


// GET /api/dashboard/category-distribution
router.get('/category-distribution', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const distribution = await User.aggregate([
      { $match: { role: 'worker', status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ success: true, data: distribution });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
