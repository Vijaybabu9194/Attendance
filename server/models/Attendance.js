const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker is required']
  },

  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  checkInLocation: {
    lat: Number,
    lng: Number
  },
  checkOutLocation: {
    lat: Number,
    lng: Number
  },

  workingHours: {
    type: Number, // in hours
    default: 0
  },
  overtime: {
    type: Number, // in hours
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
    default: 'absent'
  },
  markedBy: {
    type: String,
    enum: ['gps', 'manual', 'incharge'],
    default: 'gps'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index: one attendance record per worker per day
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

attendanceSchema.index({ date: 1 });

// Calculate working hours on check-out
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.workingHours = Math.round(diff * 100) / 100;
    if (this.workingHours > 8) {
      this.overtime = Math.round((this.workingHours - 8) * 100) / 100;
    }
    if (this.workingHours < 4) {
      this.status = 'half-day';
    } else {
      this.status = 'present';
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
