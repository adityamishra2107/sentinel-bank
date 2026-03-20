const prisma = require('../utils/prisma');
const sendEmail = require('../utils/email');

const checkDeviceAndLocation = async (user, currentIp, currentDevice) => {
  let isNewDevice = false;

  // If we have previous login data and it doesn't match
  if (
    (user.lastLoginIp && user.lastLoginIp !== currentIp) ||
    (user.lastLoginDevice && user.lastLoginDevice !== currentDevice)
  ) {
    isNewDevice = true;

    // Send security alert email
    const message = `
      Hello ${user.name},
      
      We noticed a new login to your SentinelBank account.
      
      Details:
      IP Address: ${currentIp}
      Device: ${currentDevice}
      Time: ${new Date().toLocaleString()}
      
      If this was you, you can safely ignore this email. If you don't recognize this activity, please reset your password immediately or contact support to freeze your account.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Security Alert: New Login Detected on SentinelBank',
        message,
      });
      console.log(`Security alert email sent to ${user.email} for IP: ${currentIp}`);
    } catch (err) {
      console.error('Failed to send security alert email', err);
    }
  }

  // Update user with new login info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginIp: currentIp,
      lastLoginDevice: currentDevice,
    },
  });

  return isNewDevice;
};

module.exports = {
  checkDeviceAndLocation,
};
