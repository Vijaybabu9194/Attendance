const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users - List users with filters
router.get('/', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    const { role, status, site, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Incharges can only see workers assigned to them
    if (req.user.role === 'incharge') {
      query.supervisor = req.user.id;
      query.role = 'worker';
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/incharges
router.get('/incharges', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const incharges = await User.find({ role: 'incharge' })
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: incharges });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/workers
router.get('/workers', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    const query = { role: 'worker' };
    if (req.user.role === 'incharge') {
      query.supervisor = req.user.id;
    }
    const workers = await User.find(query)
      .populate('supervisor', 'name')
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: workers });
  } catch (err) {
    next(err);
  }
});

// POST /api/users - Create user
router.post('/', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    // Incharges can only create workers
    if (req.user.role === 'incharge') {
      req.body.role = 'worker';
      req.body.supervisor = req.user._id;
    }

    if (!req.body.email) delete req.body.email;
    if (!req.body.password) delete req.body.password;

    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('supervisor', 'name email phone');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id
router.put('/:id', protect, authorize('super_admin', 'incharge'), async (req, res, next) => {
  try {
    // Don't allow password updates through this route
    delete req.body.password;
    if (!req.body.email) delete req.body.email;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id - Deactivate
router.delete('/:id', protect, authorize('super_admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'inactive' }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
