const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = require('../utils/prisma');

// Initialize Razorpay with fallback test keys if env vars are missing
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret',
});

// 1. Create Order
const createDepositOrder = async (req, res) => {
  const { amount, accountId } = req.body;

  if (!amount || !accountId) {
    return res.status(400).json({ message: 'Amount and Account ID are required' });
  }

  try {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: parseInt(accountId), userId: req.user.id }
    });

    if (!account) return res.status(404).json({ message: 'Account not found' });

    const options = {
      amount: amount * 100, // Razorpay amount is in paise (multiply by 100)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).json({ message: 'Some error occurred' });

    // Save pending deposit intent in DB
    const deposit = await prisma.deposit.create({
      data: {
        accountId: account.id,
        amount: parseFloat(amount),
        razorpayOrderId: order.id,
        status: 'PENDING',
      }
    });

    res.json({ order, depositId: deposit.id });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Verify Payment Signature
const verifySignature = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, depositId } = req.body;

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret';

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await prisma.deposit.update({
        where: { id: parseInt(depositId) },
        data: { status: 'FAILED' }
      });
      return res.status(400).json({ message: 'Invalid signature. Payment failed.' });
    }

    // Payment is valid! Execute DB updates within a transaction
    const deposit = await prisma.deposit.findUnique({ where: { id: parseInt(depositId) } });
    
    if (!deposit || deposit.status === 'SUCCESS') {
      return res.status(400).json({ message: 'Invalid or already processed deposit' });
    }

    const result = await prisma.$transaction([
      prisma.deposit.update({
        where: { id: deposit.id },
        data: { 
          status: 'SUCCESS',
          razorpayPaymentId
        }
      }),
      prisma.account.update({
        where: { id: deposit.accountId },
        data: { balance: { increment: deposit.amount } }
      })
    ]);

    res.json({ 
      message: 'Payment verified successfully and balance updated!',
      newBalance: result[1].balance 
    });

  } catch (error) {
    console.error('Signature Verification Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Simulated Add Funds (For Testing)
const simulateAddFunds = async (req, res) => {
  const { amount, accountId } = req.body;

  if (!amount || !accountId) {
    return res.status(400).json({ message: 'Amount and Account ID are required' });
  }

  try {
    const account = await prisma.account.findFirst({
      where: { id: parseInt(accountId), userId: req.user.id }
    });

    if (!account) return res.status(404).json({ message: 'Account not found' });

    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: { balance: { increment: parseFloat(amount) } }
    });

    // Create a generic transaction record for "ADD_FUNDS"
    await prisma.transaction.create({
      data: {
        senderAccount: "BANK_SYSTEM",
        receiverAccount: account.accountNumber,
        amount: parseFloat(amount),
        status: 'SUCCESS',
        category: 'Deposit',
      }
    });

    res.json({
      message: `Successfully added ₹${amount} simulation funds!`,
      newBalance: updatedAccount.balance
    });
  } catch (error) {
    console.error('Simulation Add Funds Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDepositOrder,
  verifySignature,
  simulateAddFunds
};
