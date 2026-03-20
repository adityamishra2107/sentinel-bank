const express = require('express');
const router = express.Router();
const { getContacts, addContact } = require('../controller/contactController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getContacts);
router.post('/', protect, addContact);

module.exports = router;
