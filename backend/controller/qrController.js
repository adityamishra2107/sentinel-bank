const prisma = require('../utils/prisma');

const getUserByQR = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        accounts: {
          where: { status: 'ACTIVE' },
          select: {
            accountNumber: true,
            ifscCode: true,
            accountType: true,
          },
          take: 1, // Just get the primary/first active account
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('QR Fetch User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserByQR,
};
