const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const { createAuditLog } = require('../utils/audit');
const logger = require('../utils/logger');

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return { accessToken };
};

const generateOtp = () => {
  // In production, integrate with SMS gateway (e.g., MSG91, Twilio)
  // For demo: always returns a fixed pattern or random 6-digit
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password, aadhaarLast4 } = req.body;

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.email === email ? 'Email already registered' : 'Phone already registered',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, aadhaarLast4, role: 'CITIZEN' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    await createAuditLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      req,
    });

    const { accessToken } = generateTokens(user);

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken },
    });
  } catch (err) {
    logger.error('Register error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken } = generateTokens(user);

    await createAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      req,
    });

    const { passwordHash, ...safeUser } = user;

    logger.info(`User logged in: ${email}`);

    return res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, accessToken },
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * POST /api/auth/otp/send
 */
const sendOtp = async (req, res) => {
  try {
    const { phone, purpose } = req.body;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60000);

    // Upsert OTP record
    await prisma.otpVerification.create({
      data: { phone, otp, purpose: purpose || 'LOGIN', expiresAt },
    });

    // In production: send via SMS gateway
    // For demo: return OTP in dev mode only
    logger.info(`OTP generated for ${phone}: ${otp}`);

    const responseData = { message: 'OTP sent successfully', expiresAt };
    if (process.env.NODE_ENV === 'development') {
      responseData.otp = otp; // Only expose in dev
    }

    return res.json({ success: true, data: responseData });
  } catch (err) {
    logger.error('Send OTP error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

/**
 * POST /api/auth/otp/verify
 */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, purpose } = req.body;

    const record = await prisma.otpVerification.findFirst({
      where: {
        phone,
        otp,
        purpose: purpose || 'LOGIN',
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // If aadhaar KYC purpose, mark user as verified
    if (purpose === 'AADHAAR_KYC') {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { aadhaarVerified: true },
        });
      }
    }

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    logger.error('Verify OTP error', { error: err.message });
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        aadhaarVerified: true,
        isActive: true,
        createdAt: true,
        _count: { select: { transfers: true, notifications: true } },
      },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, data: user });
  } catch (err) {
    logger.error('GetMe error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

module.exports = { register, login, sendOtp, verifyOtp, getMe };
