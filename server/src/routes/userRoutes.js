const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, updateProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.get('/profile', (req, res) => res.json({ success: true, data: req.user }));
router.put('/profile', updateProfile);
router.get('/', admin, getUsers);
router.post('/', admin, createUser);
router.get('/:id', admin, getUser);
router.put('/:id', admin, updateUser);
router.delete('/:id', admin, deleteUser);

module.exports = router;
