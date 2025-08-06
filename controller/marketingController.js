const db = require('../config/db');
const { sendApplicationEmail } = require('../services/emailService');

// Function to generate a unique referral code
const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let referralCode;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    referralCode = '';
    for (let i = 0; i < codeLength; i++) {
      referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    try {
      const existing = await db.selectAll(
        'tbl_digital_marketing_applications',
        'referral_code',
        'referral_code = ?',
        [referralCode]
      );

      if (existing.length === 0) break;
    } catch (error) {
      console.error('Error checking referral code uniqueness:', error);
      throw new Error('Failed to generate unique referral code');
    }
    
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique referral code after multiple attempts');
  }

  return referralCode;
};

const applyForDigitalMarketing = async (req, res) => {
  const { name, email, phone, referralCode } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Indian phone validation (starts with 6–9 and 10 digits only)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: 'Invalid Indian phone number format. It must be 10 digits and start with 6-9.' });
  }

  try {
    let existing;
    try {
      existing = await db.selectAll(
        'tbl_digital_marketing_applications',
        'email',
        'email = ?',
        [email]
      );
    } catch (dbError) {
      console.error('Database error checking existing email:', dbError);
      return res.status(500).json({ error: 'Database error. Please try again later.' });
    }

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Application with this email already exists' });
    }

    let referredBy = null;
    if (referralCode) {
      try {
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
      } catch (dbError) {
        console.error('Database error checking referral code:', dbError);
        return res.status(500).json({ error: 'Database error validating referral code.' });
      }
    }

    let newReferralCode;
    try {
      newReferralCode = await generateReferralCode();
    } catch (codeError) {
      console.error('Error generating referral code:', codeError);
      return res.status(500).json({ error: 'Failed to generate referral code. Please try again.' });
    }

    let result;
    try {
      result = await db.insert('tbl_digital_marketing_applications', {
        name,
        email,
        phone,
        referral_code: newReferralCode,
        referred_by: referredBy,
        created_at: new Date(),
      });
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      if (insertError.code === 'ER_DUP_ENTRY' || insertError.errno === 1062) {
        return res.status(409).json({ error: 'Application with this email already exists' });
      }
      return res.status(500).json({ error: 'Failed to save application. Please try again.' });
    }

    if (result.affected_rows > 0) {
      setImmediate(async () => {
        try {
          await sendApplicationEmail(email, name, newReferralCode);
          console.log(`Email sent successfully to ${email}`);
        } catch (emailError) {
          console.error(`Email failed for ${email}:`, emailError.message);
        }
      });

      return res.status(201).json({
        message: 'Application submitted successfully',
        referralCode: newReferralCode,
      });
    }

    throw new Error('Insert operation completed but no rows were affected');
  } catch (err) {
    console.error('Unexpected application error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};


module.exports = { applyForDigitalMarketing };