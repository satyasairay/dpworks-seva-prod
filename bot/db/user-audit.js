const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  phone: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: 'inbound' }, // inbound/outbound/system
  context: String // e.g. "onboarding", "task", etc.
});

module.exports = mongoose.model('Audit', auditSchema);
