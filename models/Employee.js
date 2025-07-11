const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  experience: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  salary: { type: Number, required: true }
});

module.exports = mongoose.model('Employee', EmployeeSchema); 