const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers, getTransferById, updateDepartmentStatus } = require('../controllers/transferController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, createTransferSchema, updateDeptStatusSchema } = require('../middlewares/validate');

router.post('/', authenticate, authorize('CITIZEN'), validate(createTransferSchema), createTransfer);
router.get('/', authenticate, getTransfers);
router.get('/:id', authenticate, getTransferById);
router.patch('/:id/department/:department', authenticate, authorize('OFFICER', 'ADMIN'), validate(updateDeptStatusSchema), updateDepartmentStatus);

module.exports = router;
