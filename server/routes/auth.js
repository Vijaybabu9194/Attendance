const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/check-phone
router.post('/check-phone', async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Please provide phone number' });

    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Not eligible' });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    res.status(200).json({
      success: true,
      exists: true,
      mpinSet: !!user.password
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup-mpin
router.post('/setup-mpin', async (req, res, next) => {
  try {
    const { phone, mpin } = req.body;
    if (!phone || !mpin || mpin.length !== 4) {
      return res.status(400).json({ success: false, message: 'Please provide phone and a 4-digit MPIN' });
    }

    const user = await User.findOne({ phone }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.password) return res.status(400).json({ success: false, message: 'MPIN is already set' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Account is deactivated' });

    user.password = mpin;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, phone, mpin } = req.body;

    let user;
    let passwordToCompare;

    if (email && password) {
      user = await User.findOne({ email }).select('+password');
      passwordToCompare = password;
    } else if (phone && mpin) {
      user = await User.findOne({ phone }).select('+password');
      passwordToCompare = mpin;
    } else {
      return res.status(400).json({ success: false, message: 'Please provide credentials' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please setup your MPIN first' });
    }

    const isMatch = await user.comparePassword(passwordToCompare);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('supervisor', 'name email phone');
  res.status(200).json({ success: true, user });
});

module.exports = router;
