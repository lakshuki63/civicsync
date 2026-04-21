/**
 * Rule-based Chatbot for CivicSync
 * 
 * Handles common citizen queries about property transfer,
 * document requirements, fees, and status tracking.
 * 
 * Config: Set OPENAI_API_KEY in .env to upgrade to GPT-4o
 */

const RESPONSES = {
  greeting: [
    'Namaste! 🙏 I\'m CivicBot, your assistant for property transfer queries. How can I help you today?',
    'Hello! Welcome to CivicSync. I can help you with transfer status, documents, fees, and more.',
  ],
  documents: `📄 **Required Documents for Property Transfer:**

1. **Sale Deed** (registered, stamped) — Mandatory
2. **Encumbrance Certificate** — Last 15 years
3. **ID Proof** — Aadhaar / PAN / Passport
4. **Address Proof** — Utility bill / Bank statement
5. **Property Tax Receipts** — Last 3 years
6. **No-Objection Certificate** — If applicable (housing society)
7. **Khata Certificate** — For Bangalore properties

📤 Upload all documents in JPG, PNG, or PDF format (max 10MB each).`,

  fees: `💰 **Transfer Fee Structure:**

| Department | Fee |
|---|---|
| Property Tax | ₹500 |
| Electricity Board | ₹300 |
| Water Supply | ₹200 |
| Gas Connection | ₹150 |
| Land Records | ₹1,000 |

**Total for all departments: ₹2,150**

Payments are accepted via UPI, Net Banking, or Credit/Debit cards.`,

  status: `📊 **Understanding Transfer Status:**

- 🟡 **Draft** — Request saved, not submitted yet
- 🔵 **Submitted** — Request received by the system
- ⏳ **Payment Pending** — Fees need to be paid
- 🔄 **In Review** — Officers are reviewing your request
- ✅ **Approved** — Transfer complete!
- ❌ **Rejected** — Check remarks for reason; you can reapply

Track your status in real-time on your **Dashboard → My Requests**.`,

  timeline: `⏱️ **Expected Processing Timeline:**

- **Document Verification:** 1–2 working days
- **Property Tax:** 3–5 working days
- **Electricity Transfer:** 2–3 working days
- **Water Supply:** 3–5 working days
- **Gas Connection:** 5–7 working days
- **Land Records Update:** 7–15 working days

**Total expected: 15–30 working days**
Urgent processing may be available for certain departments.`,

  digilocker: `🔐 **DigiLocker Integration:**

CivicSync is integrated with DigiLocker so you can:
- Fetch your Aadhaar, PAN, and property documents directly
- Skip manual uploads for government-issued documents
- Get documents verified automatically

Click **"Fetch from DigiLocker"** on the Upload Documents page.`,

  aadhaar: `🪪 **Aadhaar eKYC:**

Your identity is verified through Aadhaar OTP-based eKYC:
1. Enter your 12-digit Aadhaar number
2. Receive OTP on your registered mobile
3. Enter OTP to verify
4. Your profile is auto-filled with verified data

This is a one-time process per account.`,

  contact: `📞 **Contact & Support:**

- **Helpline:** 1800-XXX-XXXX (Toll-free, 9AM–6PM)
- **Email:** support@civicsync.gov.in
- **Grievance Portal:** /grievance
- **State Nodal Officer:** Available in your district office

For urgent matters, visit your **nearest District Collector's office**.`,

  default: `I'm not sure I understood that. Here are things I can help with:

• **Documents** — What documents do I need?
• **Fees** — How much does transfer cost?
• **Status** — What do the statuses mean?
• **Timeline** — How long does it take?
• **DigiLocker** — How to fetch docs automatically?
• **Aadhaar KYC** — How does verification work?
• **Contact** — How to reach support?

Type any keyword above or ask your question!`,
};

const matchIntent = (message) => {
  const lower = message.toLowerCase();
  if (/hi|hello|namaste|hey|start|help/.test(lower)) return 'greeting';
  if (/document|doc|deed|certificate|upload|paper|proof/.test(lower)) return 'documents';
  if (/fee|cost|charge|pay|price|amount|money|rupee|₹/.test(lower)) return 'fees';
  if (/status|stage|progress|pending|approved|rejected/.test(lower)) return 'status';
  if (/time|day|week|long|duration|when|deadline|timeline/.test(lower)) return 'timeline';
  if (/digilocker|digi|locker|digital|fetch/.test(lower)) return 'digilocker';
  if (/aadhaar|aadhar|kyc|verify|otp|mobile/.test(lower)) return 'aadhaar';
  if (/contact|help|support|phone|email|officer|grievance/.test(lower)) return 'contact';
  return 'default';
};

/**
 * POST /api/chatbot/message
 */
const handleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 600));

    const intent = matchIntent(message);
    const responsePool = RESPONSES[intent];
    const response = Array.isArray(responsePool)
      ? responsePool[Math.floor(Math.random() * responsePool.length)]
      : responsePool;

    return res.json({
      success: true,
      data: {
        message: response,
        intent,
        timestamp: new Date().toISOString(),
        source: 'rule-based', // Change to 'openai' when API key is configured
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Chatbot error' });
  }
};

module.exports = { handleMessage };
