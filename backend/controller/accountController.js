const { PrismaClient } = require('@prisma/client');
const prisma = require('../utils/prisma');

// Helper to generate a unique 12-digit account number
const generateAccountNumber = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

const createAccount = async (req, res) => {
  const { accountType } = req.body; // 'SAVINGS' or 'CURRENT'

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // KYC Check before allowing account creation
    if (!user.isActive) {
      return res.status(403).json({ message: 'Please complete your KYC profile to open an account.' });
    }

    const newAccount = await prisma.account.create({
      data: {
        userId: req.user.id,
        accountNumber: generateAccountNumber(),
        ifscCode: 'BANK0001234', // Mock IFSC Code
        accountType: accountType || 'SAVINGS',
      },
    });

    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id },
    });
    
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAccount,
  getAccounts,
};
