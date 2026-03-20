const { PrismaClient } = require('@prisma/client');
const prisma = require('../utils/prisma');

// 1. View all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Block/Unblock account
const toggleAccountStatus = async (req, res) => {
  const { accountId } = req.params;
  const { status } = req.body; // 'ACTIVE', 'BLOCKED', 'CLOSED'

  try {
    const account = await prisma.account.update({
      where: { id: parseInt(accountId) },
      data: { status },
    });
    res.json({ message: `Account status updated to ${status}`, account });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Approve KYC (Activate User)
const approveKYC = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isActive: true },
    });
    res.json({ message: 'User KYC approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. See flagged transactions
const getFlaggedTransactions = async (req, res) => {
  try {
    const flagged = await prisma.transaction.findMany({
      where: { isFlagged: true, status: 'PENDING' },
      orderBy: { timestamp: 'desc' },
    });
    res.json(flagged);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Review Flagged Transaction (Approve/Reject)
const reviewTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const { action } = req.body; // 'APPROVE' or 'REJECT'

  try {
    const tx = await prisma.transaction.findUnique({ where: { id: parseInt(transactionId) } });
    if (!tx || !tx.isFlagged || tx.status !== 'PENDING') {
      return res.status(400).json({ message: 'Transaction not found or not pending review.' });
    }

    if (action === 'APPROVE') {
      const result = await prisma.$transaction([
        prisma.account.update({
          where: { accountNumber: tx.senderAccount },
          data: { balance: { decrement: tx.amount } },
        }),
        prisma.account.update({
          where: { accountNumber: tx.receiverAccount },
          data: { balance: { increment: tx.amount } },
        }),
        prisma.transaction.update({
          where: { id: tx.id },
          data: { status: 'SUCCESS', isFlagged: false },
        }),
      ]);
      res.json({ message: 'Transaction approved', transaction: result[2] });
    } else {
      const rejectedTx = await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'FAILED', isFlagged: false },
      });
      res.json({ message: 'Transaction rejected', transaction: rejectedTx });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 6. View reports (Basic Aggregation)
const getSystemReport = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const totalTransactions = await prisma.transaction.count({ where: { status: 'SUCCESS' } });
    
    const moneyVolumeAgg = await prisma.transaction.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });
    
    const depositVolumeAgg = await prisma.deposit.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    // Generate 7-day trailing data for charts
    const chartData = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);

      const dailyTxAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'SUCCESS',
          timestamp: { gte: startOfDay, lte: d }
        }
      });
      
      const dailyDepositAgg = await prisma.deposit.aggregate({
         _sum: { amount: true },
         where: { 
           status: 'SUCCESS',
           timestamp: { gte: startOfDay, lte: d }
         }
      });

      chartData.push({
        name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        "Transferred": dailyTxAgg._sum.amount || 0,
        "Deposits": dailyDepositAgg._sum.amount || 0
      });
    }

    res.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      totalMoneyVolume: (moneyVolumeAgg._sum.amount || 0) + (depositVolumeAgg._sum.amount || 0),
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  toggleAccountStatus,
  approveKYC,
  getFlaggedTransactions,
  reviewTransaction,
  getSystemReport,
};
