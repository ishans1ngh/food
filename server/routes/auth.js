import express from 'express';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate OTP for phone number
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Mock SMS service (in production, use services like Twilio, AWS SNS, etc.)
const sendSMS = async (phone, otp) => {
  console.log(`📱 SMS to ${phone}: Your SmartBasket OTP is ${otp}. Valid for 5 minutes.`);
  // In production, integrate with actual SMS service
  return true;
};

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, purpose = 'login' } = req.body;

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
    }

    // Check if user exists for login, or doesn't exist for register
    const existingUser = await User.findOne({ phone });
    
    if (purpose === 'register' && existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }
    
    if (purpose === 'login' && !existingUser) {
      return res.status(400).json({ message: 'No account found with this phone number' });
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 60000) } // 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait before requesting another OTP',
        retryAfter: 60 - Math.floor((Date.now() - recentOTP.createdAt) / 1000)
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    const otpDoc = new OTP({
      phone,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    await otpDoc.save();

    // Send SMS (mock implementation)
    await sendSMS(phone, otp);

    res.json({
      message: 'OTP sent successfully',
      phone,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP and login/register
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, purpose = 'login', name } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit Indian mobile number' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'OTP must be 6 digits' });
    }

    // Find valid OTP
    const otpDoc = await OTP.findOne({
      phone,
      otp,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      // Increment attempts for existing OTP
      await OTP.updateOne(
        { phone, purpose, isUsed: false },
        { $inc: { attempts: 1 } }
      );
      
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check attempts
    if (otpDoc.attempts >= 3) {
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP' });
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    let user;

    if (purpose === 'register') {
      // Validate name for registration
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
      }

      // Create new user
      user = new User({
        name: name.trim(),
        phone,
        isPhoneVerified: true
      });
      await user.save();
    } else {
      // Find existing user for login
      user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Update last login and verify phone
      user.lastLogin = new Date();
      user.isPhoneVerified = true;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: purpose === 'register' ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        preferences: user.preferences,
        isPhoneVerified: user.isPhoneVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        preferences: req.user.preferences,
        savedItems: req.user.savedItems,
        isPhoneVerified: req.user.isPhoneVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) user.email = email;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        preferences: user.preferences,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

export default router;