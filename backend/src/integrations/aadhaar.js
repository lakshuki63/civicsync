/**
 * Mock Aadhaar eKYC Integration
 * 
 * In production, use UIDAI's Authentication API via licensed AUA/KUA
 * Reference: https://uidai.gov.in/ecosystem/authentication-devices-documents/developer-section.html
 */

const crypto = require('crypto');

/**
 * POST /api/integrations/aadhaar/kyc
 * Simulate Aadhaar OTP-based KYC
 */
const initiateKyc = async (req, res) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || aadhaarNumber.length !== 12) {
    return res.status(400).json({ success: false, message: 'Invalid Aadhaar number (must be 12 digits)' });
  }

  await new Promise((r) => setTimeout(r, 1000));

  const txnId = crypto.randomUUID();
  const maskedAadhaar = `XXXX XXXX ${aadhaarNumber.slice(-4)}`;

  return res.json({
    success: true,
    data: {
      txnId,
      maskedAadhaar,
      message: `OTP sent to mobile linked with ${maskedAadhaar} (MOCK - check your dev console)`,
      mockOtp: '123456', // Only in dev
    },
  });
};

/**
 * POST /api/integrations/aadhaar/verify
 * Verify the OTP and return KYC data
 */
const verifyKyc = async (req, res) => {
  const { txnId, otp, aadhaarLast4 } = req.body;

  if (!txnId || !otp) {
    return res.status(400).json({ success: false, message: 'txnId and otp are required' });
  }

  await new Promise((r) => setTimeout(r, 800));

  // Mock: any 6-digit OTP is valid in dev
  if (otp.length !== 6) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  const kycData = {
    verified: true,
    maskedAadhaar: `XXXX XXXX ${aadhaarLast4 || '0000'}`,
    name: 'Rajesh Kumar',
    dob: '1985-06-20',
    gender: 'M',
    address: {
      house: '123',
      street: 'MG Road',
      locality: 'Indiranagar',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    },
    photo: null, // In production: base64 JPEG
    verifiedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: 'Aadhaar KYC verified successfully (MOCK)',
    data: kycData,
  });
};

module.exports = { initiateKyc, verifyKyc };
