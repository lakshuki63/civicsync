const express = require('express');
const router = express.Router();
const { getUsers, updateUser, getAuditLogs, getStats } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, updateUserRoleSchema } = require('../middlewares/validate');

router.get('/stats', authenticate, authorize('ADMIN'), getStats);
router.get('/users', authenticate, authorize('ADMIN'), getUsers);
router.patch('/users/:id', authenticate, authorize('ADMIN'), validate(updateUserRoleSchema), updateUser);
router.get('/audit-logs', authenticate, authorize('ADMIN'), getAuditLogs);

module.exports = router;
