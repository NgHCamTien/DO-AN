const express = require('express');
const router = express.Router();
const { subscribe, list, remove } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', subscribe);
router.get('/', protect, admin, list);
router.delete('/:id', protect, admin, remove);

module.exports = router;
