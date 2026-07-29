const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getStudents);
router.post('/', adminOrTrainer, createStudent);
router.get('/:id', getStudent);
router.put('/:id', adminOrTrainer, updateStudent);
router.delete('/:id', adminOrTrainer, deleteStudent);

module.exports = router;
