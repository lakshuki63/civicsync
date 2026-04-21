const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  aadhaarLast4: z.string().length(4, 'Aadhaar last 4 digits required').optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const otpSendSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'AADHAAR_KYC', 'PAYMENT']).optional(),
});

const otpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
  purpose: z.enum(['LOGIN', 'REGISTER', 'AADHAAR_KYC', 'PAYMENT']).optional(),
});

// ─── Transfer Schemas ─────────────────────────────────────────────────────────

const createTransferSchema = z.object({
  propertyRegistrationNumber: z.string().min(1, 'Property registration number required'),
  newOwnerName: z.string().min(2),
  newOwnerPhone: z.string().regex(/^[6-9]\d{9}$/),
  newOwnerAadhaarLast4: z.string().length(4).optional(),
  address: z.string().min(10),
  district: z.string().min(2),
  state: z.string().min(2),
  departments: z
    .array(z.enum(['PROPERTY_TAX', 'ELECTRICITY', 'WATER', 'GAS', 'LAND_RECORDS']))
    .min(1, 'Select at least one department'),
});

const updateDeptStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'IN_REVIEW']),
  remarks: z.string().max(500).optional(),
});

// ─── Admin Schemas ─────────────────────────────────────────────────────────────

const updateUserRoleSchema = z.object({
  role: z.enum(['CITIZEN', 'OFFICER', 'ADMIN']),
  department: z.enum(['PROPERTY_TAX', 'ELECTRICITY', 'WATER', 'GAS', 'LAND_RECORDS']).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  createTransferSchema,
  updateDeptStatusSchema,
  updateUserRoleSchema,
};
