const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee } = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getEmployees);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);

module.exports = router;
