const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');
const sendEmail = require('../utils/email');
const { checkDeviceAndLocation } = require('./securityController');

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password, isBiometric } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Allow login if password matches OR if it's a valid biometric request (simulated)
    const isPasswordCorrect = password ? await bcrypt.compare(password, user.password) : false;
    
    if (isPasswordCorrect || (isBiometric && user)) {
      // Security Check: IP and Device
      const currentIp = req.ip || req.connection.remoteAddress;
      const currentDevice = req.headers['user-agent'] || 'Unknown Device';
      
      checkDeviceAndLocation(user, currentIp, currentDevice).catch(err => 
        console.error("Device check failed in background", err)
      );

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExp: otpExp,
      },
    });

    // Send Email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP - Sentinel Bank',
        message: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        html: `<h3>Password Reset Requested</h3><p>Your OTP for password reset is: <b>${otp}</b></p><p>It is valid for 10 minutes.</p>`
      });
      res.json({ message: 'OTP sent to your email' });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetOtp !== otp || new Date() > user.resetOtpExp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExp: null,
      },
    });

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
