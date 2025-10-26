const express = require('express');
const blockController = require('../controllers/blockController');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireAuth, blockController.getBlockList);

module.exports = router;
