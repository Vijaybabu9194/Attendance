const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/leaves
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    if (req.user.role === 'worker') {
      query.worker = req.user.id;
    } else if (req.user.role === 'incharge') {
      const workers = await User.find({ supervisor: req.user.id, role: 'worker' }).select('_id');
      query.worker = { $in: workers.map(w => w._id) };
    }

    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .populate('worker', 'name employeeId category phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaves,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/leaves
router.post('/', protect, authorize('worker'), async (req, res, next) => {
  try {
    const worker = await User.findById(req.user.id);
    req.body.worker = req.user.id;

    const leave = await LeaveRequest.create(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leaves/:id/approve
router.put('/:id/approve', protect, authorize('incharge', 'super_admin'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('worker', 'name employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
});

// PUT /api/leaves/:id/reject
router.put('/:id/reject', protect, authorize('incharge', 'super_admin'), async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: req.body.reason,
        approvedBy: req.user.id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('worker', 'name employeeId');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
