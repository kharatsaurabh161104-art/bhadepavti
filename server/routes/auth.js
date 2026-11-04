const express = require('express');
const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken, requireAuth, requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    name: user.fullName || user.username,
    role: user.role,
    lastLoginAt: user.lastLoginAt || null,
  };
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'कृपया युझरनेम आणि पासवर्ड टाका (Please enter username and password)',
      });
    }

    const user = await User.findOne({
      username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' },
    }).select('+password');

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'अवैध युझरनेम किंवा पासवर्ड! (Invalid username or password)',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      success: true,
      message: 'लॉगिन यशस्वी!',
      user: publicUser(user),
      token: signToken(user),
    });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user: publicUser(user) });
  }),
);

router.post(
  '/register',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'username and password are required' });
    }

    const existing = await User.findOne({
      username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const user = await User.create({
      username,
      password: hashPassword(password),
      fullName: typeof req.body.fullName === 'string' ? req.body.fullName.trim() : username,
      role: typeof req.body.role === 'string' && req.body.role.trim() ? req.body.role.trim() : 'Operator',
    });

    return res.status(201).json({ success: true, user: publicUser(user) });
  }),
);

router.get(
  '/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: 1 });
    return res.json({ success: true, count: users.length, users: users.map(publicUser) });
  }),
);

module.exports = router;
