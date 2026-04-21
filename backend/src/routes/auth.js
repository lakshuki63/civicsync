const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtp, getMe } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate, registerSchema, loginSchema, otpSendSchema, otpVerifySchema } = require('../middlewares/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/otp/send', validate(otpSendSchema), sendOtp);
router.post('/otp/verify', validate(otpVerifySchema), verifyOtp);
router.get('/me', authenticate, getMe);

module.exports = router;
