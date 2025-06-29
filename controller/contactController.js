const db = require('../config/db');

const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate subject
        const validSubjects = [
            'Digital Marketing Course Inquiry',
            'Hiring Needs',
            'Agency Services',
            'Website Development',
            'General Inquiry'
        ];
        if (!validSubjects.includes(subject)) {
            return res.status(400).json({ error: 'Invalid subject selected' });
        }

        // Insert form data into database
        const result = await db.insert('tbl_contact_messages', {
            name,
            email,
            phone,
            subject,
            message,
            created_at: new Date()
        });

        res.status(201).json({
            message: 'Form submitted successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitContactForm };