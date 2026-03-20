const express = require('express');
const { protect, admin } = require('../middleware/auth');
const {
  getAllUsers,
  toggleAccountStatus,
  approveKYC,
  getFlaggedTransactions,
  reviewTransaction,
  getSystemReport,
} = require('../controller/adminController');

const router = express.Router();

// All routes here are protected and require admin privileges
router.use(protect, admin);

router.get('/users', getAllUsers);
router.put('/account/:accountId/status', toggleAccountStatus);
router.put('/kyc/:userId/approve', approveKYC);
router.get('/transactions/flagged', getFlaggedTransactions);
router.put('/transactions/:transactionId/review', reviewTransaction);
router.get('/reports', getSystemReport);

module.exports = router;
