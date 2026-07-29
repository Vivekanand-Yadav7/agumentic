const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, default: 100 },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: { type: Date },
    fileUrl: { type: String, default: '' },
    remarks: { type: String, default: '' },
    marksObtained: { type: Number },
    status: {
      type: String,
      enum: ['submitted', 'late', 'not_submitted', 'graded'],
      default: 'not_submitted'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
