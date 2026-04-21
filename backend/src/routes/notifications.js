const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middlewares/auth');
const logger = require('../utils/logger');

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' && { read: false }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
    ]);

    return res.json({
      success: true,
      data: { notifications, unreadCount, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
    });
  } catch (err) {
    logger.error('Get notifications error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    });
    return res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

module.exports = router;
