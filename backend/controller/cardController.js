const prisma = require('../utils/prisma');

// @desc    Issue a virtual card for an account
// @route   POST /api/cards/issue
// @access  Private
const issueCard = async (req, res) => {
  const { accountId } = req.body;

  try {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(accountId) },
      include: { cards: true }
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (account.cards.length > 0) {
      return res.status(400).json({ message: 'Card already exists for this account' });
    }

    // Generate random card details
    const cardNumber = '4' + Math.random().toString().slice(2, 17); // Random 16 digits starting with 4
    const expiryDate = '12/28';
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const pin = '1234';

    const card = await prisma.card.create({
      data: {
        cardNumber,
        expiryDate,
        cvv,
        pin,
        accountId: parseInt(accountId)
      }
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get card by account ID
// @route   GET /api/cards/account/:accountId
// @access  Private
const getCardByAccountId = async (req, res) => {
  const { accountId } = req.params;

  try {
    const card = await prisma.card.findFirst({
      where: { accountId: parseInt(accountId) }
    });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Security: Check if account belongs to user
    const account = await prisma.account.findUnique({
      where: { id: parseInt(accountId) }
    });

    if (account.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle card freeze
// @route   PATCH /api/cards/:id/freeze
// @access  Private
const toggleFreeze = async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { account: true }
    });

    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.account.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updatedCard = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { isFrozen: !card.isFrozen }
    });

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update card settings (Online/ATM)
// @route   PATCH /api/cards/:id/settings
// @access  Private
const updateSettings = async (req, res) => {
  const { id } = req.params;
  const { onlineEnabled, atmEnabled } = req.body;

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { account: true }
    });

    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.account.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updatedCard = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { 
        onlineEnabled: onlineEnabled !== undefined ? onlineEnabled : card.onlineEnabled,
        atmEnabled: atmEnabled !== undefined ? atmEnabled : card.atmEnabled
      }
    });

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update card PIN
// @route   PATCH /api/cards/:id/pin
// @access  Private
const updatePin = async (req, res) => {
  const { id } = req.params;
  const { pin } = req.body;

  try {
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: { account: true }
    });

    if (!card) return res.status(404).json({ message: 'Card not found' });
    if (card.account.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updatedCard = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { pin }
    });

    res.json({ message: 'PIN updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  issueCard,
  getCardByAccountId,
  toggleFreeze,
  updateSettings,
  updatePin
};
