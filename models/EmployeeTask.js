const mongoose = require('mongoose');

const EmployeeTaskSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  task: {
    type: String,
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  estimateTime: {
    type: Number // in hours
  },
  status: {
    type: String,
    enum: ['assigned', 'in progress', 'paused', 'completed', 'failed'],
    default: 'assigned'
  }
});

module.exports = mongoose.model('EmployeeTask', EmployeeTaskSchema); 