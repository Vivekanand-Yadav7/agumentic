const express = require('express');
const router = express.Router();
const { getFees, createFee, updateFee, deleteFee } = require('../controllers/feeController');
const { protect, admin, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getFees);
router.post('/', adminOrTrainer, createFee);
router.put('/:id', adminOrTrainer, updateFee);
router.delete('/:id', admin, deleteFee);

module.exports = router;
