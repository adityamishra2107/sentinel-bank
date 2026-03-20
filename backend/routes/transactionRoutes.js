const express = require('express');
const { protect } = require('../middleware/auth');
const { transferMoney, getTransactionHistory, getSpendingInsights } = require('../controller/transactionController');

const router = express.Router();

router.post('/transfer', protect, transferMoney);
router.get('/history', protect, getTransactionHistory);
router.get('/insights', protect, getSpendingInsights);

module.exports = router;
