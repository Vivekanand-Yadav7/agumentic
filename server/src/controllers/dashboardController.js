const prisma = require('../config/prisma');

// GET /api/dashboard — role-based
const getDashboard = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === 'employer' || role === 'admin') {
      // ── Employer / Admin Dashboard ──────────────────────────
      const [totalEmployees, totalProjects, pendingLeaves, paidPayrolls] = await Promise.all([
        prisma.user.count({ where: { role: 'employee', status: 'active' } }),
        prisma.project.count(),
        prisma.leave.count({ where: { status: 'pending' } }),
        prisma.payroll.count({ where: { status: 'paid' } }),
      ]);

      const ongoingProjects = await prisma.project.count({ where: { status: 'ongoing' } });
      const completedProjects = await prisma.project.count({ where: { status: 'completed' } });

      const recentProjects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { assignments: { include: { employee: { select: { name: true, avatar: true } } } } }
      });

      const pendingLeaveList = await prisma.leave.findMany({
        where: { status: 'pending' },
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: { employee: { select: { name: true, designation: true, department: true } } }
      });

      const recentEmployees = await prisma.user.findMany({
        where: { role: 'employee' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, designation: true, department: true, status: true, joiningDate: true }
      });

      return res.json({
        success: true,
        data: {
          dashboardType: 'employer',
          stats: { totalEmployees, totalProjects, pendingLeaves, ongoingProjects, completedProjects },
          recentProjects,
          pendingLeaveList,
          recentEmployees
        }
      });
    } else {
      // ── Employee Dashboard ──────────────────────────────────
      const [myProjects, myLeaves, latestPayroll] = await Promise.all([
        prisma.projectAssignment.count({ where: { employeeId: id } }),
        prisma.leave.count({ where: { employeeId: id, status: 'pending' } }),
        prisma.payroll.findFirst({
          where: { employeeId: id },
          orderBy: [{ year: 'desc' }, { month: 'desc' }]
        })
      ]);

      const recentProjects = await prisma.projectAssignment.findMany({
        where: { employeeId: id },
        include: { project: true },
        orderBy: { assignedAt: 'desc' },
        take: 5
      });

      const recentLeaves = await prisma.leave.findMany({
        where: { employeeId: id },
        orderBy: { appliedAt: 'desc' },
        take: 5
      });

      const payrolls = await prisma.payroll.findMany({
        where: { employeeId: id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 3
      });

      // This month attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const attendanceCount = await prisma.attendance.count({
        where: { employeeId: id, date: { gte: startOfMonth }, status: 'present' }
      });

      return res.json({
        success: true,
        data: {
          dashboardType: 'employee',
          stats: { myProjects, pendingLeaves: myLeaves, netSalary: latestPayroll?.netSalary || 0, presentDays: attendanceCount },
          recentProjects,
          recentLeaves,
          payrolls
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard };
