const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadDocument, getDocument, getDocumentsByRequest } = require('../controllers/documentController');
const { authenticate, authorize } = require('../middlewares/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'), false);
  },
});

router.post('/upload', authenticate, authorize('CITIZEN'), upload.single('file'), uploadDocument);
router.get('/request/:requestId', authenticate, getDocumentsByRequest);
router.get('/:id', authenticate, getDocument);

module.exports = router;
