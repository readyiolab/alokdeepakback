const db = require('../config/db');
const { sendApplicationEmail } = require('../services/emailService');

const applyForDigitalMarketing = async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await db.selectAll(
      'tbl_digital_marketing_applications',
      'email',
      'email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Application with this email already exists' });
    }

    const result = await db.insert('tbl_digital_marketing_applications', {
      name,
      email,
      phone,
    });

    if (result.status) {
      try {
        await sendApplicationEmail(email, name); // Optional email notification
      } catch (e) {
        console.warn('Email failed but application saved:', e.message);
      }
      return res.status(201).json({ message: 'Application submitted successfully' });
    }

    throw new Error('Insert failed');
  } catch (err) {
    console.error('Application error:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

module.exports = { applyForDigitalMarketing };
