const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// GET /api/employees — employer sees all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: { in: ['employee', 'employer'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        department: true,
        designation: true,
        salary: true,
        joiningDate: true,
        address: true
      }
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/employees — add new employee/user
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, role, department, designation, salary, address } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'employee',
        department,
        designation,
        salary: parseFloat(salary) || 0,
        address
      }
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/employees/:id — update employee info
const updateEmployee = async (req, res) => {
  try {
    const { name, phone, role, status, department, designation, salary, address } = req.body;

    const employee = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        phone,
        role,
        status,
        department,
        designation,
        salary: parseFloat(salary) || 0,
        address
      }
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEmployees, createEmployee, updateEmployee };
