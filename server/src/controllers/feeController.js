const Fee = require('../models/Fee');
const Student = require('../models/Student');

const getFees = async (req, res) => {
  try {
    const { student, status, paymentMode, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};
    if (student) query.student = student;
    if (status) query.status = status;
    if (paymentMode) query.paymentMode = paymentMode;
    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Fee.countDocuments(query);
    const fees = await Fee.find(query)
      .populate('student', 'name studentId email phone')
      .populate('course', 'title')
      .populate('batch', 'name batchCode')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalRevenue = await Fee.aggregate([
      { $match: { ...query, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: fees,
      totalRevenue: totalRevenue[0]?.total || 0,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFee = async (req, res) => {
  try {
    req.body.collectedBy = req.user._id;
    const fee = await Fee.create(req.body);

    // Update student paid fees
    await Student.findByIdAndUpdate(req.body.student, {
      $inc: { paidFees: req.body.amount }
    });

    // Update student fee status
    const student = await Student.findById(req.body.student);
    if (student) {
      let feeStatus = 'pending';
      if (student.paidFees >= student.totalFees) feeStatus = 'paid';
      else if (student.paidFees > 0) feeStatus = 'partial';
      await Student.findByIdAndUpdate(req.body.student, { feeStatus });
    }

    await fee.populate('student', 'name studentId');
    res.status(201).json({ success: true, data: fee, message: 'Fee recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name studentId');
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, data: fee, message: 'Fee updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    // Revert student paid fees
    await Student.findByIdAndUpdate(fee.student, { $inc: { paidFees: -fee.amount } });
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFees, createFee, updateFee, deleteFee };
