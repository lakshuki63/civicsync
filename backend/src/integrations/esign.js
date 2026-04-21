/**
 * Mock eSign Integration
 * 
 * In production, integrate with NeSL / eMudhra / CertifyDoc eSign APIs
 * Reference: https://www.cca.gov.in/esign.html
 */

const crypto = require('crypto');

/**
 * POST /api/integrations/esign/initiate
 * Initiate eSign flow for a document
 */
const initiateESign = async (req, res) => {
  const { documentId, signerAadhaarLast4, purpose } = req.body;

  if (!documentId) {
    return res.status(400).json({ success: false, message: 'documentId is required' });
  }

  await new Promise((r) => setTimeout(r, 1000));

  const sessionId = crypto.randomBytes(12).toString('hex').toUpperCase();

  return res.json({
    success: true,
    data: {
      sessionId,
      documentId,
      status: 'OTP_SENT',
      message: `OTP sent to Aadhaar-linked mobile (XXXXXXXX${signerAadhaarLast4 || '????'})`,
      mockOtp: '654321',
      expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
    },
  });
};

/**
 * POST /api/integrations/esign/confirm
 * Confirm eSign with OTP
 */
const confirmESign = async (req, res) => {
  const { sessionId, otp, documentId } = req.body;

  if (!sessionId || !otp) {
    return res.status(400).json({ success: false, message: 'sessionId and otp are required' });
  }

  await new Promise((r) => setTimeout(r, 1200));

  if (otp.length !== 6) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  const signatureRef = `ESIGN-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

  return res.json({
    success: true,
    message: 'Document eSigned successfully (MOCK)',
    data: {
      signatureRef,
      documentId,
      signedAt: new Date().toISOString(),
      signedDocumentUrl: `https://mock-esign.gov.in/signed/${documentId}.pdf`,
      certificate: {
        serialNumber: `CERT-${Date.now()}`,
        issuedBy: 'CertifyDoc (MOCK)',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
      },
    },
  });
};

module.exports = { initiateESign, confirmESign };
