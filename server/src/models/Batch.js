const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  batchCode: { type: String, unique: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  timing: { type: String, default: '' }, // e.g. "9:00 AM - 11:00 AM"
  days: [{ type: String }], // ["Mon", "Wed", "Fri"]
  maxStudents: { type: Number, default: 30 },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
