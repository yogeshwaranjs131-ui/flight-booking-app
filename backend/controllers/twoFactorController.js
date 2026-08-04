import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User.js';

/**
 * @desc    Generate a 2FA secret and QR code
 * @route   POST /api/users/2fa/generate
 * @access  Private
 */
export const generateTwoFactorSecret = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `FlightBookingApp (${req.user.email})`,
    });

    // Temporarily save the secret to the user model to verify it later
    req.user.twoFactorTempSecret = secret.base32;
    await req.user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        throw new Error('Could not generate QR code.');
      }
      res.json({
        secret: secret.base32,
        qrCodeUrl: data_url,
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify a 2FA token and enable 2FA
 * @route   POST /api/users/2fa/verify
 * @access  Private
 */
export const verifyAndEnableTwoFactor = async (req, res) => {
  const { token } = req.body;

  try {
    if (!req.user.twoFactorTempSecret) {
      return res.status(400).json({ success: false, message: '2FA secret not generated yet. Please generate a secret first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorTempSecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      req.user.twoFactorSecret = req.user.twoFactorTempSecret;
      req.user.isTwoFactorEnabled = true;
      req.user.twoFactorTempSecret = undefined; // Clear temporary secret
      await req.user.save();
      res.json({ success: true, message: '2FA has been enabled successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token. Please try again.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Disable 2FA
 * @route   POST /api/users/2fa/disable
 * @access  Private
 */
export const disableTwoFactor = async (req, res) => {
  try {
    req.user.isTwoFactorEnabled = false;
    req.user.twoFactorSecret = undefined;
    req.user.twoFactorTempSecret = undefined;
    await req.user.save();
    res.json({ success: true, message: '2FA has been disabled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};