const cloudinary = require('cloudinary').v2;
const prisma = require('../lib/prisma');
const { createAuditLog } = require('../utils/audit');
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/documents/upload
 * Upload document to Cloudinary and save record to DB
 */
const uploadDocument = async (req, res) => {
  try {
    const { requestId, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Verify request belongs to citizen
    const transfer = await prisma.transferRequest.findFirst({
      where: { id: requestId, citizenId: req.user.id },
    });

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    let fileUrl = '';

    // Try Cloudinary upload; fall back to mock URL in dev
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `civicsync/${requestId}`, resource_type: 'auto', tags: [type, requestId] },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        stream.end(req.file.buffer);
      });
      fileUrl = result.secure_url;
    } else {
      // Mock URL for development
      fileUrl = `https://res.cloudinary.com/mock/civicsync/${requestId}/${req.file.originalname}`;
      logger.warn('Cloudinary not configured — using mock URL');
    }

    const document = await prisma.document.create({
      data: {
        requestId,
        type,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: document.id,
      metadata: { type, fileName: req.file.originalname },
      req,
    });

    return res.status(201).json({ success: true, message: 'Document uploaded', data: document });
  } catch (err) {
    logger.error('Upload document error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

/**
 * GET /api/documents/:id
 */
const getDocument = async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { request: { select: { citizenId: true } } },
    });

    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role === 'CITIZEN' && document.request.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, data: document });
  } catch (err) {
    logger.error('Get document error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch document' });
  }
};

/**
 * GET /api/documents/request/:requestId
 */
const getDocumentsByRequest = async (req, res) => {
  try {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: req.params.requestId },
      select: { citizenId: true },
    });

    if (!transfer) return res.status(404).json({ success: false, message: 'Request not found' });
    if (req.user.role === 'CITIZEN' && transfer.citizenId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const documents = await prisma.document.findMany({
      where: { requestId: req.params.requestId },
      orderBy: { uploadedAt: 'desc' },
    });

    return res.json({ success: true, data: documents });
  } catch (err) {
    logger.error('Get documents by request error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

module.exports = { uploadDocument, getDocument, getDocumentsByRequest };
