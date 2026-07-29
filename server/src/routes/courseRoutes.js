const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, admin, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getCourses);
router.post('/', adminOrTrainer, createCourse);
router.get('/:id', getCourse);
router.put('/:id', adminOrTrainer, updateCourse);
router.delete('/:id', admin, deleteCourse);

module.exports = router;
