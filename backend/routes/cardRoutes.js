const express = require('express');
const router = express.Router();
const { 
  issueCard, 
  getCardByAccountId, 
  toggleFreeze, 
  updateSettings, 
  updatePin 
} = require('../controller/cardController');
const { protect } = require('../middleware/auth');

router.post('/issue', protect, issueCard);
router.get('/account/:accountId', protect, getCardByAccountId);
router.patch('/:id/freeze', protect, toggleFreeze);
router.patch('/:id/settings', protect, updateSettings);
router.patch('/:id/pin', protect, updatePin);

module.exports = router;
