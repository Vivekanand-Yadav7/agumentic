const express = require('express');
const router = express.Router();
const { getLeaves, applyLeave, reviewLeave, cancelLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getLeaves);
router.post('/', applyLeave);
router.put('/:id/review', reviewLeave);
router.delete('/:id', cancelLeave);

module.exports = router;
