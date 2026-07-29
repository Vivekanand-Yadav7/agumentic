const prisma = require('../config/prisma');

// GET /api/attendance — get attendance list
const getAttendance = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const where = {
      date: {
        gte: targetDate,
        lt: nextDate
      }
    };

    if (role === 'employee') {
      where.employeeId = id;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, designation: true, department: true } }
      }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/attendance/check-in — employee or employer marks attendance
const markAttendance = async (req, res) => {
  try {
    const { employeeId, status, checkIn, checkOut, remarks, date } = req.body;

    const empId = employeeId || req.user.id;
    const attDate = date ? new Date(date) : new Date();
    attDate.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: empId,
          date: attDate
        }
      },
      update: {
        status: status || 'present',
        checkIn,
        checkOut,
        remarks
      },
      create: {
        employeeId: empId,
        date: attDate,
        status: status || 'present',
        checkIn: checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        checkOut,
        remarks
      }
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAttendance, markAttendance };
