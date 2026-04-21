const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { initiateDigiLocker, fetchDigiLockerDocs } = require('../integrations/digilocker');
const { initiateKyc, verifyKyc } = require('../integrations/aadhaar');
const { initiateESign, confirmESign } = require('../integrations/esign');
const { handleMessage } = require('../integrations/chatbot');

// DigiLocker
router.get('/digilocker/initiate', authenticate, initiateDigiLocker);
router.post('/digilocker/fetch', authenticate, fetchDigiLockerDocs);

// Aadhaar eKYC
router.post('/aadhaar/kyc', authenticate, initiateKyc);
router.post('/aadhaar/verify', authenticate, verifyKyc);

// eSign
router.post('/esign/initiate', authenticate, initiateESign);
router.post('/esign/confirm', authenticate, confirmESign);

// Chatbot (public — no auth required)
router.post('/chatbot/message', handleMessage);

module.exports = router;
