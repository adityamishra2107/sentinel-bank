const prisma = require('../utils/prisma');

// @desc    Get user's contacts
// @route   GET /api/contacts
// @access  Private
const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id },
      include: {
        contactUser: {
          select: {
            id: true,
            name: true,
            email: true,
            accounts: {
              select: {
                accountNumber: true
              }
            }
          }
        }
      }
    });

    const formattedContacts = contacts.map(c => ({
      id: c.id,
      name: c.nickname || c.contactUser.name,
      email: c.contactUser.email,
      accountNumber: c.contactUser.accounts[0]?.accountNumber || ''
    }));

    res.json(formattedContacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a contact by email or account number
// @route   POST /api/contacts
// @access  Private
const addContact = async (req, res) => {
  const { email, accountNumber, nickname } = req.body;

  try {
    let contactUser;
    if (email) {
      contactUser = await prisma.user.findUnique({ where: { email } });
    } else if (accountNumber) {
      const account = await prisma.account.findUnique({ 
        where: { accountNumber },
        include: { user: true }
      });
      contactUser = account?.user;
    }

    if (!contactUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (contactUser.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot add yourself as a contact' });
    }

    const contact = await prisma.contact.create({
      data: {
        userId: req.user.id,
        contactUserId: contactUser.id,
        nickname
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Contact already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContacts,
  addContact
};
