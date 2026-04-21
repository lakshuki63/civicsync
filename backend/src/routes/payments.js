const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middlewares/auth');
const { createAuditLog } = require('../utils/audit');
const logger = require('../utils/logger');

// POST /api/payments/initiate
router.post('/initiate', authenticate, authorize('CITIZEN'), async (req, res) => {
  try {
    const { requestId } = req.body;

    const transfer = await prisma.transferRequest.findFirst({
      where: { id: requestId, citizenId: req.user.id },
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    // Mock Razorpay order creation
    // In production: const razorpay = new Razorpay({...}); const order = await razorpay.orders.create({...})
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        requestId,
        amount: transfer.totalFee,
        status: 'PENDING',
        gatewayOrder: mockOrderId,
      },
    });

    // Update transfer status
    await prisma.transferRequest.update({
      where: { id: requestId },
      data: { status: 'PAYMENT_PENDING' },
    });

    return res.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: mockOrderId,
        amount: transfer.totalFee,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
        // In production this comes from Razorpay API
      },
    });
  } catch (err) {
    logger.error('Initiate payment error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
});

// POST /api/payments/verify
router.post('/verify', authenticate, authorize('CITIZEN'), async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { request: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Mock signature verification
    // In production: verify HMAC-SHA256 signature from Razorpay
    const isValid = true; // Mock always passes in dev

    if (!isValid) {
      await prisma.payment.update({ where: { id: paymentId }, data: { status: 'FAILED' } });
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Mark payment success
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        gatewayRef: razorpayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`,
        method: 'UPI',
        paidAt: new Date(),
      },
    });

    // Update transfer status to IN_REVIEW
    await prisma.transferRequest.update({
      where: { id: payment.requestId },
      data: { status: 'IN_REVIEW' },
    });

    // Notify citizen
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Payment Successful',
        message: `₹${payment.amount} paid. Your transfer request is now under review.`,
        type: 'SUCCESS',
        link: `/transfer/${payment.requestId}`,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'PAYMENT_SUCCESS',
      entityType: 'PAYMENT',
      entityId: paymentId,
      metadata: { amount: payment.amount },
      req,
    });

    return res.json({ success: true, message: 'Payment verified', data: { status: 'SUCCESS', amount: payment.amount } });
  } catch (err) {
    logger.error('Verify payment error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router;
