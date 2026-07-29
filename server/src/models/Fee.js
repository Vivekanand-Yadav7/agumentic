const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  receiptNumber: { type: String, unique: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: {
    type: String,
    enum: ['cash', 'online', 'cheque', 'bank_transfer', 'upi'],
    default: 'cash'
  },
  transactionId: { type: String, default: '' },
  purpose: { type: String, default: 'Course Fee' },
  status: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  },
  remarks: { type: String, default: '' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-generate receipt number
feeSchema.pre('save', async function (next) {
  if (!this.receiptNumber) {
    let generated = false;
    let attempts = 0;
    while (!generated && attempts < 10) {
      const count = await this.constructor.countDocuments();
      const candidate = `RCP${String(count + 1 + attempts).padStart(5, '0')}`;
      const exists = await this.constructor.findOne({ receiptNumber: candidate });
      if (!exists) {
        this.receiptNumber = candidate;
        generated = true;
      }
      attempts++;
    }
    if (!generated) {
      this.receiptNumber = `RCP${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
