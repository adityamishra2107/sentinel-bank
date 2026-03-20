const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserByQR } = require('../controller/qrController');

const router = express.Router();

router.get('/user/:id', protect, getUserByQR);

module.exports = router;
