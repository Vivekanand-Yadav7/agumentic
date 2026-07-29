const express = require('express');
const router = express.Router();
const { getEnquiries, createEnquiry, updateEnquiry, addNote, deleteEnquiry } = require('../controllers/enquiryController');
const { protect, adminOrTrainer } = require('../middleware/auth');

router.use(protect);
router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.put('/:id', updateEnquiry);
router.post('/:id/notes', addNote);
router.delete('/:id', adminOrTrainer, deleteEnquiry);

module.exports = router;
