const express = require('express');
const router = express.Router();
const { getContacts, addContact, deleteContact } = require('../controller/contactController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getContacts);
router.post('/', protect, addContact);
router.delete('/:id', protect, deleteContact);

module.exports = router;
