const prisma = require('../utils/prisma');

const chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  try {
    // Determine the intent of the message (Simulated NLP for Portfolio)
    const normalizedMessage = message.toLowerCase();
    
    // Default fallback response
    let aiResponse = "I'm your SentinelBank AI Assistant. I can help analyze your expenses, suggest savings, and provide spending breakdowns. Try asking: 'Analyze my spending' or 'How much did I spend this month?'";

    if (normalizedMessage.includes('spend') && (normalizedMessage.includes('month') || normalizedMessage.includes('total'))) {
      // Fetch user's total spending for the current month
      const userAccounts = await prisma.account.findMany({
        where: { userId },
        select: { accountNumber: true },
      });
      const accountNums = userAccounts.map(a => a.accountNumber);
      
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const transactions = await prisma.transaction.findMany({
        where: {
          senderAccount: { in: accountNums },
          status: 'SUCCESS',
          timestamp: { gte: currentMonthStart }
        }
      });

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (totalSpent === 0) {
        aiResponse = "You haven't spent anything this month yet! Great job saving. Keep it up.";
      } else {
        aiResponse = `You have spent ₹${totalSpent.toLocaleString('en-IN')} so far this month. Make sure to stay within your budget!`;
      }

    } else if (normalizedMessage.includes('category') || normalizedMessage.includes('breakdown')) {
       // Category breakdown
       const userAccounts = await prisma.account.findMany({
        where: { userId },
        select: { accountNumber: true },
      });
      const accountNums = userAccounts.map(a => a.accountNumber);

      const transactions = await prisma.transaction.findMany({
        where: {
          senderAccount: { in: accountNums },
          status: 'SUCCESS',
        }
      });

      if (transactions.length === 0) {
         aiResponse = "I don't see any outgoing transactions to analyze yet.";
      } else {
        const categories = {};
        transactions.forEach(t => {
          categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
        
        // Find top category
        const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
        aiResponse = `Your highest spending category is **${topCategory}** with ₹${categories[topCategory].toLocaleString('en-IN')}. Consider reducing expenses here to increase your savings rate.`;
      }
    } else if (normalizedMessage.includes('budget') || normalizedMessage.includes('save') || normalizedMessage.includes('suggestion')) {
       aiResponse = "Based on your risk profile, I suggest following the 50/30/20 rule: 50% on needs, 30% on wants, and 20% savings. Currently, our predictive model indicates setting aside an extra ₹5,000 this month will greatly improve your financial health score.";
    }

    res.json({ reply: aiResponse });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: "Sorry, my AI core is currently experiencing technical difficulties. Please try again later." });
  }
};

module.exports = {
  chatWithAI
};
