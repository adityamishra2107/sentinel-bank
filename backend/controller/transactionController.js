const { PrismaClient } = require('@prisma/client');
const sendEmail = require('../utils/email');

const prisma = require('../utils/prisma');

// BASIC AI FRAUD DETECTION LOGIC (Rule-Based for MVP)
const analyzeFraudRisk = async (senderAccountObj, amount) => {
  let isFlagged = false;
  let reason = '';

  // Rule 1: High value transaction
  if (amount > 100000) {
    isFlagged = true;
    reason += 'High value transaction (> 1,00,000). ';
  }

  // Rule 2: High frequency (e.g. multiple transfers in 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTransactions = await prisma.transaction.count({
    where: {
      senderAccount: senderAccountObj.accountNumber,
      timestamp: { gte: oneHourAgo },
    },
  });

  if (recentTransactions >= 5) {
    isFlagged = true;
    reason += 'High frequency: >5 transactions in the last hour. ';
  }

  return { isFlagged, reason };
};

const categorizeTransaction = (amount) => {
  if (amount < 1000) return 'Food & Dining';
  if (amount >= 1000 && amount < 5000) return 'Shopping';
  if (amount >= 5000 && amount < 15000) return 'Travel & Transport';
  if (amount >= 15000 && amount < 30000) return 'Utility Bills';
  if (amount >= 30000) return 'Investments';
  return 'Transfer';
};

const transferMoney = async (req, res) => {
  const { senderAccountNum, receiverAccountNum, amount } = req.body;

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0' });
  }

  if (senderAccountNum === receiverAccountNum) {
    return res.status(400).json({ message: 'Cannot transfer to the same account' });
  }

  try {
    // 1. Fetch sender and receiver accounts
    const sender = await prisma.account.findUnique({
      where: { accountNumber: senderAccountNum },
      include: { user: true },
    });

    const receiver = await prisma.account.findUnique({
      where: { accountNumber: receiverAccountNum },
      include: { user: true },
    });

    if (!sender) return res.status(404).json({ message: 'Sender account not found' });
    if (!receiver) return res.status(404).json({ message: 'Receiver account not found' });

    // Authorization: User can only transfer from their own account (unless admin)
    if (sender.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to transfer from this account' });
    }

    if (sender.status !== 'ACTIVE' || receiver.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'One of the accounts is blocked or closed' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // 2. Fraud Detection
    const fraudAnalysis = await analyzeFraudRisk(sender, amount);
    const predictedCategory = categorizeTransaction(amount);
    const riskScore = fraudAnalysis.isFlagged ? 85.5 : Math.min(amount / 50000 * 100, 45.0);

    if (fraudAnalysis.isFlagged) {
      // Create a flagged transaction, don't deduct money yet (Pending review)
      const flaggedTx = await prisma.transaction.create({
        data: {
          senderAccount: senderAccountNum,
          receiverAccount: receiverAccountNum,
          amount,
          status: 'PENDING',
          isFlagged: true,
          category: predictedCategory,
          riskScore: riskScore,
        },
      });

      // Notify admin & user
      await sendEmail({
        email: sender.user.email,
        subject: 'Security Alert: Suspicious Transaction Flagged',
        message: `Your transaction of ${amount} to account ${receiverAccountNum} has been flagged for security reasons. Reason: ${fraudAnalysis.reason}`,
      });

      return res.status(403).json({
        message: 'Transaction flagged as suspicious and is pending manual review.',
        transaction: flaggedTx,
      });
    }

    // 3. Perform Transaction (Atomic Prisma Transaction)
    const result = await prisma.$transaction([
      // Deduct from sender
      prisma.account.update({
        where: { accountNumber: senderAccountNum },
        data: { balance: { decrement: amount } },
      }),
      // Add to receiver
      prisma.account.update({
        where: { accountNumber: receiverAccountNum },
        data: { balance: { increment: amount } },
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          senderAccount: senderAccountNum,
          receiverAccount: receiverAccountNum,
          amount,
          status: 'SUCCESS',
          isFlagged: false,
          category: predictedCategory,
          riskScore: riskScore,
        },
      }),
    ]);

    // Send email notification on success
    try {
      if (sender.user && sender.user.email) {
        await sendEmail({
          email: sender.user.email,
          subject: 'Transaction Successful',
          message: `Successfully transferred ${amount} to account ${receiverAccountNum}. New Balance: ${result[0].balance}`,
        });
      }
    } catch (e) { console.error('Email sending failed', e); }

    res.status(200).json({
      message: 'Transfer successful',
      transaction: result[2],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userAccounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      select: { accountNumber: true },
    });

    const accountNums = userAccounts.map((a) => a.accountNumber);

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderAccount: { in: accountNums } },
          { receiverAccount: { in: accountNums } },
        ],
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSpendingInsights = async (req, res) => {
  try {
    const userAccounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      select: { accountNumber: true },
    });

    const accountNums = userAccounts.map((a) => a.accountNumber);

    // Fetch transactions where user is either sender or receiver
    const transactions = await prisma.transaction.findMany({
      where: { 
        OR: [
          { senderAccount: { in: accountNums } },
          { receiverAccount: { in: accountNums } }
        ],
        status: 'SUCCESS'
      },
      orderBy: { timestamp: 'asc' }
    });

    const categoryData = {};
    const monthlySpending = {};
    const monthlyIncome = {};
    let totalSpent = 0;
    let totalIncome = 0;

    transactions.forEach(t => {
      const monthObj = new Date(t.timestamp);
      const monthKey = monthObj.toLocaleString('en-US', { month: 'short' });

      if (accountNums.includes(t.senderAccount)) {
        // Outgoing
        totalSpent += t.amount;
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + t.amount;
      } else {
        // Incoming
        totalIncome += t.amount;
        monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + t.amount;
      }
    });

    const pieChart = Object.keys(categoryData).map(k => ({ name: k, value: categoryData[k] }));
    
    // Merge monthly data for the bar/line charts
    const allMonths = Array.from(new Set([...Object.keys(monthlySpending), ...Object.keys(monthlyIncome)]));
    // Sort months if possible, but for now just use the keys
    const barChart = allMonths.map(m => ({ month: m, spent: monthlySpending[m] || 0 }));
    const cashflowChart = allMonths.map(m => ({ 
      month: m, 
      income: monthlyIncome[m] || 0, 
      expense: monthlySpending[m] || 0 
    }));

    res.json({
      totalSpent,
      totalIncome,
      pieChart,
      barChart,
      cashflowChart,
      riskProfile: totalSpent > 200000 ? 'High Risk' : totalSpent > 50000 ? 'Moderate' : 'Safe',
      savingRate: (totalIncome - totalSpent) > 0 ? (((totalIncome - totalSpent) / totalIncome) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving insights' });
  }
};

module.exports = {
  transferMoney,
  getTransactionHistory,
  getSpendingInsights,
};
