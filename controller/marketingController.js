const db = require('../config/db');
const { sendApplicationEmail } = require('../services/emailService');

// Function to generate a unique referral code
const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let referralCode;

  while (true) {
    referralCode = '';
    for (let i = 0; i < codeLength; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const existing = await db.selectAll(
      'tbl_digital_marketing_applications',
      'referral_code',
      'referral_code = ?',
      [referralCode]
    );

    if (existing.length === 0) break;
  }

  return referralCode;
};

const applyForDigitalMarketing = async (req, res) => {
  const { name, email, phone, referralCode } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate phone format (basic check for digits, adjust as needed)
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    // Check if email already exists
    const existing = await db.selectAll(
      'tbl_digital_marketing_applications',
      'email',
      'email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Application with this email already exists' });
    }

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await db.selectAll(
        'tbl_digital_marketing_applications',
        'referral_code',
        'referral_code = ?',
        [referralCode]
      );

      if (referrer.length === 0) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      referredBy = referralCode;
    }

    // Generate a new referral code for the applicant
    const newReferralCode = await generateReferralCode();

    // Insert application with referral code
    const result = await db.insert('tbl_digital_marketing_applications', {
      name,
      email,
      phone,
      referral_code: newReferralCode,
      referred_by: referredBy,
      created_at: new Date(), // Explicitly set created_at
    });

    if (result.affected_rows > 0) {
      try {
        await sendApplicationEmail(email, name, newReferralCode);
        console.log(`Email sent successfully to ${email}`);
      } catch (e) {
        console.warn(`Email failed for ${email}:`, e.message);
      }
      return res.status(201).json({
        message: 'Application submitted successfully',
        referralCode: newReferralCode,
      });
    }

    throw new Error('Insert failed');
  } catch (err) {
    console.error('Application error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

module.exports = { applyForDigitalMarketing };