const Assignment = require('../models/Assignment');

const getAssignments = async (req, res) => {
  try {
    const { batch, status } = req.query;
    const query = {};
    if (batch) query.batch = batch;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
      .populate('batch', 'name batchCode')
      .populate('course', 'title')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    req.body.assignedBy = req.user._id;
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ success: true, data: assignment, message: 'Assignment created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAssignments, createAssignment, updateAssignment, deleteAssignment };
