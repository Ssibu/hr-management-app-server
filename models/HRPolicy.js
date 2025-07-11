const mongoose = require('mongoose');

const HRPolicySchema = new mongoose.Schema({
  policyName: { type: String, required: true },
  eligibility: { type: String, required: true },
  eligibilityDays: { type: Number, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('HRPolicy', HRPolicySchema); 