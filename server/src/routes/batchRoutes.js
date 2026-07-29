const express = require('express');
const router = express.Router();
const { getBatches, getBatch, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');
const { protect, admin, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getBatches);
router.post('/', adminOrTrainer, createBatch);
router.get('/:id', getBatch);
router.put('/:id', adminOrTrainer, updateBatch);
router.delete('/:id', admin, deleteBatch);

module.exports = router;
