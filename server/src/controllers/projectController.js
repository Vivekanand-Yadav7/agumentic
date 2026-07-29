const prisma = require('../config/prisma');

// GET /api/projects — employer sees all, employee sees assigned
const getProjects = async (req, res) => {
  try {
    const { role, id } = req.user;
    let projects;
    if (role === 'employer' || role === 'admin') {
      projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: { assignments: { include: { employee: { select: { id: true, name: true, designation: true } } } } }
      });
    } else {
      const assignments = await prisma.projectAssignment.findMany({
        where: { employeeId: id },
        include: { project: { include: { assignments: { include: { employee: { select: { id: true, name: true } } } } } } },
        orderBy: { assignedAt: 'desc' }
      });
      projects = assignments.map(a => ({ ...a.project, myRole: a.role }));
    }
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects — employer only
const createProject = async (req, res) => {
  try {
    const { title, description, location, type, status, startDate, endDate, budget, clientName, clientPhone, priority } = req.body;
    const project = await prisma.project.create({
      data: { title, description, location, type, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, budget: parseFloat(budget) || 0, clientName, clientPhone, priority }
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/projects/:id — employer only
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, type, status, startDate, endDate, budget, clientName, clientPhone, priority, progress } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { title, description, location, type, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, budget: parseFloat(budget) || 0, clientName, clientPhone, priority, progress: parseInt(progress) || 0 }
    });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/projects/:id — employer only
const deleteProject = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/projects/:id/assign — assign employee to project
const assignEmployee = async (req, res) => {
  try {
    const { employeeId, role } = req.body;
    const assignment = await prisma.projectAssignment.upsert({
      where: { projectId_employeeId: { projectId: req.params.id, employeeId } },
      update: { role },
      create: { projectId: req.params.id, employeeId, role: role || 'member' }
    });
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/projects/:id/assign/:employeeId
const removeEmployee = async (req, res) => {
  try {
    await prisma.projectAssignment.delete({
      where: { projectId_employeeId: { projectId: req.params.id, employeeId: req.params.employeeId } }
    });
    res.json({ success: true, message: 'Employee removed from project' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject, assignEmployee, removeEmployee };
