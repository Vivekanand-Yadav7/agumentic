const express = require('express');
const router = express.Router();
const { getPayrolls, createPayroll, updatePayrollStatus } = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPayrolls);
router.post('/', createPayroll);
router.put('/:id/status', updatePayrollStatus);

module.exports = router;
