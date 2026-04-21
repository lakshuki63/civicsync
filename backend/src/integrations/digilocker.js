/**
 * Mock DigiLocker Integration
 * 
 * In production, replace with actual DigiLocker API:
 * https://developer.digitallocker.gov.in/
 * 
 * Flow: OAuth2 → fetch issued documents → return XML/JSON
 */

const MOCK_DOCUMENTS = {
  AADHAAR: {
    type: 'AADHAAR',
    name: 'Aadhaar Card',
    issuedBy: 'UIDAI',
    issueDate: '2018-03-15',
    data: {
      name: 'Rajesh Kumar',
      dob: '1985-06-20',
      gender: 'M',
      address: '123, MG Road, Bengaluru, Karnataka - 560001',
      maskedAadhaar: 'XXXX XXXX 4521',
    },
  },
  PROPERTY_CARD: {
    type: 'PROPERTY_CARD',
    name: 'Property Registration Certificate',
    issuedBy: 'State Registration Department',
    issueDate: '2023-11-01',
    data: {
      registrationNumber: 'KA-BLR-2023-00421',
      plotNumber: 'Plot 45-B',
      area: '1200 sq.ft',
      locality: 'Whitefield',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
    },
  },
  PAN: {
    type: 'PAN',
    name: 'PAN Card',
    issuedBy: 'Income Tax Department',
    issueDate: '2010-09-10',
    data: {
      panNumber: 'ABCDE1234F',
      name: 'Rajesh Kumar',
      dob: '1985-06-20',
    },
  },
};

/**
 * Simulate DigiLocker OAuth callback
 * In production: redirect user to DigiLocker consent page, handle callback
 */
const initiateDigiLocker = async (req, res) => {
  // Simulate a 1.5s API delay
  await new Promise((r) => setTimeout(r, 1500));

  const mockAuthUrl = `https://digilocker.gov.in/public/oauth2/1/authorize?client_id=CIVICSYNC_DEMO&redirect_uri=http://localhost:3000/digilocker/callback&state=${req.user.id}`;

  return res.json({
    success: true,
    data: {
      authUrl: mockAuthUrl,
      message: 'Redirect user to DigiLocker for authentication (MOCK)',
      note: 'In production, this redirects to the real DigiLocker OAuth2 page',
    },
  });
};

/**
 * Fetch documents from DigiLocker (mock)
 */
const fetchDigiLockerDocs = async (req, res) => {
  await new Promise((r) => setTimeout(r, 1200));

  const { docTypes = ['AADHAAR', 'PROPERTY_CARD'] } = req.body;

  const documents = docTypes
    .filter((t) => MOCK_DOCUMENTS[t])
    .map((t) => ({ ...MOCK_DOCUMENTS[t], fetchedAt: new Date().toISOString() }));

  return res.json({
    success: true,
    data: { documents, source: 'DigiLocker (MOCK)', totalFetched: documents.length },
  });
};

module.exports = { initiateDigiLocker, fetchDigiLockerDocs };
