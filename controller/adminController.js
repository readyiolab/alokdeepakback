const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin Signup Route
const signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate required fields
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }

        // Check if username already exists
        const existingUsername = await db.select('tbl_admins', '*', 'username = ?', [username]);
        if (existingUsername) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Check if email already exists
        const existingEmail = await db.select('tbl_admins', '*', 'email = ?', [email]);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new admin
        const newAdmin = {
            username,
            password: hashedPassword,
            email,
            created_at: new Date()
        };

        const result = await db.insert('tbl_admins', newAdmin);

        if (result.affected_rows === 0) {
            return res.status(500).json({ error: 'Failed to create admin account' });
        }

        // Return success message without token
        res.status(201).json({ message: 'Admin account created successfully' });
    } catch (error) {
        console.error('Error in admin signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin Login Route
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const admin = await db.select('tbl_admins', '*', 'username = ?', [username]);
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
});

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update Contact Message Status
const updateContactMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['new', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await db.update('tbl_contact_messages', { status, updated_at: new Date() }, 'id = ?', [id]);

        if (result.affected_rows === 0) {
            return res.status(404).json({ error: 'Contact message not found' });
        }

        res.json({ message: 'Contact message status updated successfully' });
    } catch (error) {
        console.error('Error updating contact message status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Contact Messages
const getContactMessages = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        let where = '';
        const params = [];

        if (status) {
            where = 'status = ?';
            params.push(status);
        }

        const orderby = 'ORDER BY created_at DESC';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const messages = await db.selectAll('tbl_contact_messages', '*', where, params, `${orderby} LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);

        const countResult = await db.query('SELECT COUNT(*) as total FROM tbl_contact_messages' + (where ? ` WHERE ${where}` : ''), params);
        const total = countResult.total;

        res.json({
            messages,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get All Digital Marketing Applications
const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, minReferrals } = req.query;
    let where = '';
    const params = [];

    if (minReferrals) {
      where = 'referral_count >= ?';
      params.push(parseInt(minReferrals));
    }

    const orderby = 'ORDER BY created_at DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Fetch applications with referral count
    const applications = await db.selectAll(
      'tbl_digital_marketing_applications',
      'id, name, email, phone, referral_code, referred_by, created_at, (SELECT COUNT(*) FROM tbl_digital_marketing_applications r WHERE r.referred_by = tbl_digital_marketing_applications.referral_code) as referral_count',
      where,
      params,
      `${orderby} LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const countResult = await db.rawQuery(
      'SELECT COUNT(*) as total FROM tbl_digital_marketing_applications' + (where ? ` WHERE ${where}` : ''),
      params
    );
    const total = countResult.total;

    res.json({
      applications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports={login,signup, updateContactMessageStatus, getContactMessages,getApplications};