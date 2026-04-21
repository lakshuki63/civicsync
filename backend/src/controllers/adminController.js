const prisma = require('../lib/prisma');
const { createAuditLog } = require('../utils/audit');
const logger = require('../utils/logger');

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          department: true, isActive: true, aadhaarVerified: true, createdAt: true,
          _count: { select: { transfers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    logger.error('Get users error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

/**
 * PATCH /api/admin/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { role, department, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...(role && { role }), ...(department !== undefined && { department }), ...(isActive !== undefined && { isActive }) },
      select: { id: true, name: true, email: true, role: true, department: true, isActive: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'ADMIN_USER_UPDATED',
      entityType: 'USER',
      entityId: req.params.id,
      metadata: { role, department, isActive },
      req,
    });

    return res.json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    logger.error('Update user error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

/**
 * GET /api/admin/audit-logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(userId && { userId }),
      ...(action && { action: { contains: action, mode: 'insensitive' } }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    logger.error('Get audit logs error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalTransfers, pendingTransfers, approvedTransfers, rejectedTransfers, totalPayments] =
      await Promise.all([
        prisma.user.count(),
        prisma.transferRequest.count(),
        prisma.transferRequest.count({ where: { status: 'SUBMITTED' } }),
        prisma.transferRequest.count({ where: { status: 'APPROVED' } }),
        prisma.transferRequest.count({ where: { status: 'REJECTED' } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalTransfers,
        pendingTransfers,
        approvedTransfers,
        rejectedTransfers,
        totalRevenue: totalPayments._sum.amount || 0,
      },
    });
  } catch (err) {
    logger.error('Get stats error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports = { getUsers, updateUser, getAuditLogs, getStats };
