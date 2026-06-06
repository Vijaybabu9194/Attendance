const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Worker is required']
  },

  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  type: {
    type: String,
    enum: ['sick', 'casual', 'earned', 'emergency', 'personal'],
    required: [true, 'Leave type is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  totalDays: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Calculate total days
leaveRequestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diff = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24);
    this.totalDays = Math.max(1, Math.ceil(diff) + 1);
  }
  next();
});

leaveRequestSchema.index({ worker: 1, status: 1 });
leaveRequestSchema.index({ status: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
