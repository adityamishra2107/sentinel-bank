const express = require('express');
const { chatWithAI } = require('../controller/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', protect, chatWithAI);

module.exports = router;
