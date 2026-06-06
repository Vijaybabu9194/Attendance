const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: 4,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    sparse: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'incharge', 'worker'],
    default: 'worker'
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['skilled', 'unskilled', 'supervisor', 'contractor', 'engineer'],
    default: 'unskilled'
  },

  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  dailyWage: {
    type: Number,
    default: 0
  },
  designation: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate employee ID
userSchema.pre('save', async function(next) {
  if (this.employeeId) return next();
  const prefix = this.role === 'super_admin' ? 'ADM' : this.role === 'incharge' ? 'INC' : 'WRK';
  const count = await mongoose.model('User').countDocuments({ role: this.role });
  this.employeeId = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('User', userSchema);
