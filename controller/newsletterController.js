const db = require('../config/db');
const { sendSubscriptionEmail, sendUnsubscriptionEmail } = require('../services/emailService');

const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email already exists
    const existing = await db.selectAll(
      'tbl_newsletter_subscribers',
      'email, status',
      'email = ?',
      [email],
      '', // Explicitly set orderby to empty string
      true // Enable query logging for debugging
    );

    if (existing.length > 0) {
      if (existing[0].status === 'active') {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else if (existing[0].status === 'unsubscribed') {
        // Re-subscribe by updating status and subscribed_at
        const updateResult = await db.update(
          'tbl_newsletter_subscribers',
          { status: 'active', subscribed_at: new Date(), unsubscribed_at: null },
          'email = ?',
          [email],
          true
        );
        if (updateResult.status) {
          try {
            await sendSubscriptionEmail(email); // Send re-subscription email
          } catch (emailError) {
            console.error('Email sending failed, but re-subscription succeeded:', emailError);
            // Continue to return success even if email fails
          }
          return res.status(200).json({ message: 'Re-subscribed successfully' });
        } else {
          throw new Error('Failed to re-subscribe');
        }
      }
    } else {
      // Insert new subscriber
      const insertResult = await db.insert(
        'tbl_newsletter_subscribers',
        {
          email,
          subscribed_at: new Date(),
          status: 'active',
          unsubscribed_at: null,
        },
        true
      );

      if (insertResult.status) {
        try {
          await sendSubscriptionEmail(email); // Send subscription email
        } catch (emailError) {
          console.error('Email sending failed, but subscription succeeded:', emailError);
          // Continue to return success even if email fails
        }
        return res.status(201).json({ message: 'Subscribed successfully' });
      } else {
        throw new Error('Failed to subscribe');
      }
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return res.status(500).json({ error: error.message || 'Failed to subscribe. Please try again.' });
  }
};

const unsubscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists
    const existing = await db.selectAll(
      'tbl_newsletter_subscribers',
      'status',
      'email = ?',
      [email],
      '',
      true
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    if (existing[0].status === 'unsubscribed') {
      return res.status(400).json({ error: 'Email is already unsubscribed' });
    }

    // Update status to unsubscribed and set unsubscribed_at
    const updateResult = await db.update(
      'tbl_newsletter_subscribers',
      { status: 'unsubscribed', unsubscribed_at: new Date() },
      'email = ?',
      [email],
      true
    );

    if (updateResult.status && updateResult.affected_rows > 0) {
      try {
        await sendUnsubscriptionEmail(email); // Send unsubscription email
      } catch (emailError) {
        console.error('Email sending failed, but unsubscription succeeded:', emailError);
        // Continue to return success even if email fails
      }
      return res.status(200).json({ message: 'Unsubscribed successfully' });
    } else {
      throw new Error('Failed to unsubscribe');
    }
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return res.status(500).json({ error: 'Failed to unsubscribe. Please try again.' });
  }
};

module.exports = { subscribeNewsletter, unsubscribeNewsletter };