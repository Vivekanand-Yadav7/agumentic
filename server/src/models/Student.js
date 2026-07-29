const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true }, // auto-generated like STU001
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  dob: { type: Date },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  qualification: { type: String, default: '' },
  occupation: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  enrollmentDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'dropped'],
    default: 'active'
  },
  feeStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending'
  },
  totalFees: { type: Number, default: 0 },
  paidFees: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  notes: { type: String, default: '' },
  referredBy: { type: String, default: '' }
}, { timestamps: true });

// Auto-generate studentId
studentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    let generated = false;
    let attempts = 0;
    while (!generated && attempts < 10) {
      const count = await this.constructor.countDocuments();
      const candidate = `STU${String(count + 1 + attempts).padStart(4, '0')}`;
      const exists = await this.constructor.findOne({ studentId: candidate });
      if (!exists) {
        this.studentId = candidate;
        generated = true;
      }
      attempts++;
    }
    if (!generated) {
      this.studentId = `STU${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
