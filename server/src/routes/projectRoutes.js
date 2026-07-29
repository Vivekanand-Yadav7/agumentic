const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject, assignEmployee, removeEmployee } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/assign', assignEmployee);
router.delete('/:id/assign/:employeeId', removeEmployee);

module.exports = router;
