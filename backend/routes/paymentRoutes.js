const express = require('express');
const { protect } = require('../middleware/auth');
const { createDepositOrder, verifySignature, simulateAddFunds } = require('../controller/paymentController');

const router = express.Router();

router.post('/create-order', protect, createDepositOrder);
router.post('/verify', protect, verifySignature);
router.post('/simulate-add-funds', protect, simulateAddFunds);

module.exports = router;
