const express = require('express');
const { protect } = require('../middleware/auth');
const { createAccount, getAccounts } = require('../controller/accountController');

const router = express.Router();

router.get('/', protect, getAccounts);
router.post('/', protect, createAccount);

module.exports = router;
