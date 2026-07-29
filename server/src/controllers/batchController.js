const Batch = require('../models/Batch');
const Student = require('../models/Student');

const getBatches = async (req, res) => {
  try {
    const { search, status, course } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { batchCode: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;
    if (course) query.course = course;

    const batches = await Batch.find(query)
      .populate('course', 'title')
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'title fees')
      .populate('trainer', 'name email phone')
      .populate('students', 'name email phone studentId status');

    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBatch = async (req, res) => {
  try {
    // Auto-generate batch code
    if (!req.body.batchCode) {
      const count = await Batch.countDocuments();
      req.body.batchCode = `BATCH${String(count + 1).padStart(3, '0')}`;
    }
    const batch = await Batch.create(req.body);
    await batch.populate('course', 'title');
    await batch.populate('trainer', 'name email');
    res.status(201).json({ success: true, data: batch, message: 'Batch created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'title')
      .populate('trainer', 'name email');

    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: batch, message: 'Batch updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBatches, getBatch, createBatch, updateBatch, deleteBatch };
