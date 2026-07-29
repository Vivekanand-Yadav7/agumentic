const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Batch = require('../models/Batch');

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const { search, status, course, batch, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (course) query.course = course;
    if (batch) query.batch = batch;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('course', 'title')
      .populate('batch', 'name batchCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: students,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('course', 'title fees')
      .populate('batch', 'name batchCode timing days trainer');
    
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const fees = await Fee.find({ student: student._id }).sort({ paymentDate: -1 });

    res.json({ success: true, data: { student, fees } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create student
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    // Add to batch if provided
    if (req.body.batch) {
      await Batch.findByIdAndUpdate(req.body.batch, {
        $addToSet: { students: student._id }
      });
    }

    await student.populate('course', 'title');
    await student.populate('batch', 'name batchCode');

    res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('course', 'title')
      .populate('batch', 'name batchCode');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, data: student, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
