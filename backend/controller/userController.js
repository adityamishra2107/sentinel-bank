const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const prisma = require('../utils/prisma');

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePic: true,
        dob: true,
        address: true,
        pan: true,
        aadhaar: true,
        isActive: true,
        role: true,
        accounts: true,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, phone, dob, address, pan, aadhaar, profilePic } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        dob: dob ? new Date(dob) : undefined,
        address: address || undefined,
        pan: pan || undefined,
        aadhaar: aadhaar || undefined,
        profilePic: profilePic || undefined,
        // Auto-activate user based on KYC completion (simple logic)
        isActive: (pan && aadhaar && address) ? true : undefined,
      },
      select: { id: true, name: true, email: true, isActive: true },
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot Password Flow
const forgotPasswordTokens = new Map(); // Simple in-memory store for demo (should be DB or Redis)

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    // Generate token
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    
    // Instead of random bytes for reset token, we use OTP
    const resetToken = otp.toString();
    const tokenExp = Date.now() + 15 * 60 * 1000; // 15 minutes

    forgotPasswordTokens.set(resetToken, { userId: user.id, exp: tokenExp });

    // Send email
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `Your OTP is ${otp}\n\nClick the link below to reset your password:\n${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message,
      });

      res.status(200).json({ 
        message: 'OTP sent to your email! (Please check spam folder too)',
      });
    } catch (err) {
      forgotPasswordTokens.delete(resetToken);
      console.error(err);
      return res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const tokenData = forgotPasswordTokens.get(token);

  if (!tokenData || tokenData.exp < Date.now()) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { password: hashedPassword },
    });

    forgotPasswordTokens.delete(token); // Clear token

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
