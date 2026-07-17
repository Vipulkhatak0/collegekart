import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { generateOTP, sendOTPEmail } from '../utils/mailer.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const otpLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, message: { message: 'Too many OTP requests. Try again later.' } });

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Normalized shape returned by every auth endpoint, so the frontend always
// gets the same fields regardless of how the user logged in.
const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  phone: user.phone,
  hostel: user.hostel,
  college: user.college,
  role: user.role,
  sellerRating: user.sellerRating,
  isSellerVerified: user.isSellerVerified,
  wishlist: user.wishlist
});

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, hostel, college } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ message: 'An account with this email already exists. Please login instead.' });
      }
      // Account exists but never completed OTP verification (e.g. an earlier attempt
      // failed to send the email) — regenerate and resend rather than dead-ending.
      const otp = generateOTP();
      existing.name = name;
      existing.password = await bcrypt.hash(password, 10);
      existing.hostel = hostel;
      existing.college = college;
      existing.otp = otp;
      existing.otpExpires = Date.now() + 10 * 60 * 1000;
      await existing.save();
      await sendOTPEmail(email, otp);
      return res.status(200).json({ message: 'Account already pending verification. A new OTP has been sent.', userId: existing._id });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const user = await User.create({
      name, email, password: hashed, hostel, college,
      otp, otpExpires: Date.now() + 10 * 60 * 1000
    });
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: 'Account created. Check your email for the OTP.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// @route POST /api/auth/verify-otp
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+otp +otpExpires');
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Verified successfully.', token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});

// @route POST /api/auth/forgot-password
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    // Don't reveal whether the email exists — always respond the same way.
    if (!user) {
      return res.json({ message: 'If an account exists with this email, an OTP has been sent.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendOTPEmail(email, otp);

    res.json({ message: 'If an account exists with this email, an OTP has been sent.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process request.', error: err.message });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', otpLimiter, async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: 'userId, otp and newPassword are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(userId).select('+otp +otpExpires');
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: 'Password reset successfully.', token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password.', error: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first.' });

    const token = signToken(user._id);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// @route POST /api/auth/google
// Body: { idToken } — the Google ID token from the frontend Google Sign-In button.
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Missing Google credential.' });

    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ message: 'Google account has no email.' });

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name, email: payload.email, googleId: payload.sub,
        avatar: payload.picture, isVerified: true
      });
    } else if (!user.isVerified) {
      // A Google login with a matching verified Google account is proof enough of ownership.
      user.isVerified = true;
      if (!user.googleId) user.googleId = payload.sub;
      if (!user.avatar) user.avatar = payload.picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed.', error: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

export default router;