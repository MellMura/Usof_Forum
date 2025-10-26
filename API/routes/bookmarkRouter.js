const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, bookmarkController.getMyBookmarks);

module.exports = router;
