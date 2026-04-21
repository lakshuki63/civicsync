const prisma = require('../lib/prisma');
const logger = require('./logger');

/**
 * Create an audit log entry for any significant action
 */
const createAuditLog = async ({ userId, action, entityType, entityId = null, metadata = null, req = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
      },
    });
  } catch (err) {
    // Don't fail the main request if audit logging fails
    logger.error('Audit log creation failed', { error: err.message, action, userId });
  }
};

module.exports = { createAuditLog };
