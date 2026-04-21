const prisma = require('../lib/prisma');
const { createAuditLog } = require('../utils/audit');
const logger = require('../utils/logger');

const DEPARTMENT_FEES = {
  PROPERTY_TAX: 500,
  ELECTRICITY: 300,
  WATER: 200,
  GAS: 150,
  LAND_RECORDS: 1000,
};

/**
 * POST /api/transfers
 * Create a new transfer request
 */
const createTransfer = async (req, res) => {
  try {
    const {
      propertyRegistrationNumber,
      newOwnerName,
      newOwnerPhone,
      address,
      district,
      state,
      departments,
    } = req.body;

    // Find or create property
    let property = await prisma.property.findUnique({
      where: { registrationNumber: propertyRegistrationNumber },
    });

    if (!property) {
      property = await prisma.property.create({
        data: {
          registrationNumber: propertyRegistrationNumber,
          address,
          district,
          state,
          previousOwnerName: req.user.email,
        },
      });
    }

    const totalFee = departments.reduce((sum, dept) => sum + (DEPARTMENT_FEES[dept] || 0), 0);

    const transfer = await prisma.transferRequest.create({
      data: {
        propertyId: property.id,
        citizenId: req.user.id,
        totalFee,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        departmentStatuses: {
          create: departments.map((dept) => ({ department: dept, status: 'PENDING' })),
        },
      },
      include: {
        property: true,
        departmentStatuses: true,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Transfer Request Submitted',
        message: `Your transfer request #${transfer.referenceId.slice(0, 8).toUpperCase()} has been submitted successfully.`,
        type: 'SUCCESS',
        link: `/transfer/${transfer.id}`,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'TRANSFER_CREATED',
      entityType: 'TRANSFER',
      entityId: transfer.id,
      req,
    });

    logger.info(`Transfer created: ${transfer.id} by user ${req.user.id}`);

    return res.status(201).json({
      success: true,
      message: 'Transfer request submitted successfully',
      data: transfer,
    });
  } catch (err) {
    logger.error('Create transfer error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to create transfer request' });
  }
};

/**
 * GET /api/transfers
 * List transfers (filtered by role)
 */
const getTransfers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (req.user.role === 'CITIZEN') {
      where.citizenId = req.user.id;
    } else if (req.user.role === 'OFFICER') {
      where.departmentStatuses = { some: { department: req.user.department } };
    }
    if (status) where.status = status;

    const [transfers, total] = await Promise.all([
      prisma.transferRequest.findMany({
        where,
        include: {
          property: true,
          citizen: { select: { id: true, name: true, email: true, phone: true } },
          departmentStatuses: true,
          documents: { select: { id: true, type: true, fileName: true } },
          payments: { select: { id: true, status: true, amount: true } },
          _count: { select: { documents: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transferRequest.count({ where }),
    ]);

    return res.json({
      success: true,
      data: { transfers, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    logger.error('Get transfers error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch transfers' });
  }
};

/**
 * GET /api/transfers/:id
 */
const getTransferById = async (req, res) => {
  try {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: req.params.id },
      include: {
        property: true,
        citizen: { select: { id: true, name: true, email: true, phone: true } },
        departmentStatuses: {
          include: { officer: { select: { id: true, name: true, email: true } } },
        },
        documents: true,
        payments: true,
        auditLogs: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    // Citizens can only see their own
    if (req.user.role === 'CITIZEN' && transfer.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, data: transfer });
  } catch (err) {
    logger.error('Get transfer by id error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch transfer' });
  }
};

/**
 * PATCH /api/transfers/:id/department/:department
 * Officer updates department status
 */
const updateDepartmentStatus = async (req, res) => {
  try {
    const { id, department } = req.params;
    const { status, remarks } = req.body;

    if (req.user.role === 'OFFICER' && req.user.department !== department) {
      return res.status(403).json({ success: false, message: 'You can only update your department' });
    }

    const deptStatus = await prisma.departmentStatus.update({
      where: { requestId_department: { requestId: id, department } },
      data: {
        status,
        remarks,
        officerId: req.user.id,
        reviewedAt: new Date(),
      },
    });

    // Check if all departments approved → update main request status
    const allStatuses = await prisma.departmentStatus.findMany({ where: { requestId: id } });
    const allApproved = allStatuses.every((s) => s.status === 'APPROVED');
    const anyRejected = allStatuses.some((s) => s.status === 'REJECTED');

    let newTransferStatus;
    if (allApproved) newTransferStatus = 'APPROVED';
    else if (anyRejected) newTransferStatus = 'REJECTED';

    const updatedTransfer = await prisma.transferRequest.update({
      where: { id },
      data: {
        ...(newTransferStatus && { status: newTransferStatus, completedAt: new Date() }),
        updatedAt: new Date(),
      },
    });

    // Notify citizen
    await prisma.notification.create({
      data: {
        userId: updatedTransfer.citizenId,
        title: `Department Update: ${department.replace('_', ' ')}`,
        message: `Your ${department.replace('_', ' ')} transfer has been ${status.toLowerCase()}.${remarks ? ' Remarks: ' + remarks : ''}`,
        type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
        link: `/transfer/${id}`,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: `DEPT_STATUS_${status}`,
      entityType: 'TRANSFER',
      entityId: id,
      metadata: { department, status, remarks },
      req,
    });

    return res.json({ success: true, message: `Status updated to ${status}`, data: deptStatus });
  } catch (err) {
    logger.error('Update dept status error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

module.exports = { createTransfer, getTransfers, getTransferById, updateDepartmentStatus };
