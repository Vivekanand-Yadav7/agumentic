const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  course: { type: String, default: '' },
  message: { type: String, default: '' },
  source: {
    type: String,
    enum: ['walk-in', 'phone', 'website', 'social_media', 'referral', 'other'],
    default: 'walk-in'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'enrolled', 'not_interested', 'follow_up'],
    default: 'new'
  },
  followUpDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{ 
    note: String, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
