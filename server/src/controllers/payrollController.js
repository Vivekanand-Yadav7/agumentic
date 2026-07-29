const prisma = require('../config/prisma');

// GET /api/payroll — employer sees all, employee sees own
const getPayrolls = async (req, res) => {
  try {
    const { role, id } = req.user;
    const where = (role === 'employer' || role === 'admin') ? {} : { employeeId: id };

    const payrolls = await prisma.payroll.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        employee: { select: { id: true, name: true, designation: true, department: true, salary: true } }
      }
    });

    res.json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payroll — employer generates payroll
const createPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, hra, allowances, deductions, tax, status, remarks } = req.body;

    const basic = parseFloat(basicSalary) || 0;
    const h = parseFloat(hra) || 0;
    const allow = parseFloat(allowances) || 0;
    const ded = parseFloat(deductions) || 0;
    const t = parseFloat(tax) || 0;
    const netSalary = basic + h + allow - ded - t;

    const payroll = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId,
          month: parseInt(month),
          year: parseInt(year)
        }
      },
      update: {
        basicSalary: basic,
        hra: h,
        allowances: allow,
        deductions: ded,
        tax: t,
        netSalary,
        status: status || 'pending',
        remarks,
        paidAt: status === 'paid' ? new Date() : null
      },
      create: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: basic,
        hra: h,
        allowances: allow,
        deductions: ded,
        tax: t,
        netSalary,
        status: status || 'pending',
        remarks,
        paidAt: status === 'paid' ? new Date() : null
      }
    });

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/payroll/:id/status — mark as paid
const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payroll = await prisma.payroll.update({
      where: { id: req.params.id },
      data: {
        status,
        paidAt: status === 'paid' ? new Date() : null
      }
    });
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPayrolls, createPayroll, updatePayrollStatus };
