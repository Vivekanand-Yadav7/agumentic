const prisma = require('../config/prisma');

// GET /api/leaves — employer sees all, employee sees own
const getLeaves = async (req, res) => {
  try {
    const { role, id } = req.user;
    const where = (role === 'employer' || role === 'admin') ? {} : { employeeId: id };
    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: {
        employee: { select: { id: true, name: true, designation: true, department: true } },
        approver: { select: { id: true, name: true } }
      }
    });
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leaves — employee applies
const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leave.create({
      data: {
        type, startDate: start, endDate: end, days, reason,
        employeeId: req.user.id
      }
    });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leaves/:id/review — employer approves/rejects
const reviewLeave = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: { status, remarks, approverId: req.user.id, reviewedAt: new Date() }
    });
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/leaves/:id — employee cancels own pending leave
const cancelLeave = async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({ where: { id: req.params.id } });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.employeeId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled' });
    await prisma.leave.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Leave cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaves, applyLeave, reviewLeave, cancelLeave };
