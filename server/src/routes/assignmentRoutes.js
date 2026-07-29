const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getAssignments);
router.post('/', adminOrTrainer, createAssignment);
router.put('/:id', adminOrTrainer, updateAssignment);
router.delete('/:id', adminOrTrainer, deleteAssignment);

module.exports = router;
