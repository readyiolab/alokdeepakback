const express = require('express');
const db = require('../config/db');

// Create a new job posting
const createJob = async (req, res) => {
    try {
        const { title, department, job_type, location, experience_level, summary, responsibilities, qualifications, preferred_skills, compensation, timezone, status = 'open' } = req.body;

        // Validate required fields
        if (!title || !department || !job_type || !location || !experience_level || !summary || !responsibilities || !qualifications) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Insert new job
        const newJob = {
            title,
            department,
            job_type,
            location,
            experience_level,
            summary,
            responsibilities: JSON.stringify(responsibilities), // Store as JSON string
            qualifications: JSON.stringify(qualifications),
            preferred_skills: preferred_skills ? JSON.stringify(preferred_skills) : null,
            compensation: compensation || null,
            timezone: timezone || null,
            status,
            created_at: new Date(),
            updated_at: new Date(),
            expiry_date: req.body.expiry_date ? new Date(req.body.expiry_date) : null
        };

        const result = await db.insert('tbl_jobs', newJob);

        if (result.affected_rows === 0) {
            return res.status(500).json({ error: 'Failed to create job posting' });
        }

        res.status(201).json({ message: 'Job posting created successfully', job_id: result.insert_id });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a job posting
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, department, job_type, location, experience_level, summary, responsibilities, qualifications, preferred_skills, compensation, timezone, status, expiry_date } = req.body;

        // Validate required fields
        if (!title || !department || !job_type || !location || !experience_level || !summary || !responsibilities || !qualifications) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Check if job exists
        const job = await db.select('tbl_jobs', '*', 'id = ?', [id]);
        if (!job) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        // Update job
        const updatedJob = {
            title,
            department,
            job_type,
            location,
            experience_level,
            summary,
            responsibilities: JSON.stringify(responsibilities),
            qualifications: JSON.stringify(qualifications),
            preferred_skills: preferred_skills ? JSON.stringify(preferred_skills) : null,
            compensation: compensation || null,
            timezone: timezone || null,
            status: status || 'open',
            updated_at: new Date(),
            expiry_date: expiry_date ? new Date(expiry_date) : null
        };

        const result = await db.update('tbl_jobs', updatedJob, 'id = ?', [id]);

        if (result.affected_rows === 0) {
            return res.status(500).json({ error: 'Failed to update job posting' });
        }

        res.json({ message: 'Job posting updated successfully' });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a job posting
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if job exists
        const job = await db.select('tbl_jobs', '*', 'id = ?', [id]);
        if (!job) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        const result = await db.delete('tbl_jobs', 'id = ?', [id]);

        if (result.affected_rows === 0) {
            return res.status(500).json({ error: 'Failed to delete job posting' });
        }

        res.json({ message: 'Job posting deleted successfully' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all job postings with filters
const getJobs = async (req, res) => {
    try {
        const { department, location, job_type, status, page = 1, limit = 10 } = req.query;
        let where = 'status != "closed"';
        const params = [];

        if (department) {
            where += ' AND department = ?';
            params.push(department);
        }
        if (location) {
            where += ' AND location = ?';
            params.push(location);
        }
        if (job_type) {
            where += ' AND job_type = ?';
            params.push(job_type);
        }
        if (status) {
            where += ' AND status = ?';
            params.push(status);
        }

        const orderby = 'ORDER BY created_at DESC';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const safeLimit = parseInt(limit);
        const safeOffset = parseInt(offset);

        const jobs = await db.queryAll(
            `SELECT * FROM tbl_jobs WHERE ${where} ${orderby} LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            params
        );

        const countResult = await db.queryAll(
            `SELECT COUNT(*) as total FROM tbl_jobs WHERE ${where}`,
            params
        );
        const total = countResult[0] ? countResult[0].total : 0;

        res.json({
            jobs,
            total,
            page: parseInt(page),
            limit: safeLimit
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Get single job posting
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await db.select('tbl_jobs', '*', 'id = ?', [id]);

        if (!job) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        // Parse JSON fields
        job.responsibilities = JSON.parse(job.responsibilities);
        job.qualifications = JSON.parse(job.qualifications);
        if (job.preferred_skills) {
            job.preferred_skills = JSON.parse(job.preferred_skills);
        }

        res.json(job);
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Submit job application
const submitApplication = async (req, res) => {
    try {
        const { job_id, full_name, email, phone, resume_url, linkedin_url, cover_letter } = req.body;

        // Validate required fields
        if (!job_id || !full_name || !email || !phone || !resume_url) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        // Check if job exists
        const job = await db.select('tbl_jobs', '*', 'id = ?', [job_id]);
        if (!job) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        // Insert application
        const newApplication = {
            job_id,
            full_name,
            email,
            phone,
            resume_url,
            linkedin_url: linkedin_url || null,
            cover_letter: cover_letter || null,
            created_at: new Date(),
            status: 'new'
        };

        const result = await db.insert('tbl_job_applications', newApplication);

        if (result.affected_rows === 0) {
            return res.status(500).json({ error: 'Failed to submit application' });
        }

        res.status(201).json({ message: 'Application submitted successfully', application_id: result.insert_id });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get applications for a job
const getApplications = async (req, res) => {
    try {
        const { job_id } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        let where = 'job_id = ?';
        const params = [job_id];

        if (status) {
            where += ' AND status = ?';
            params.push(status);
        }

        const orderby = 'ORDER BY created_at DESC';
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const safeLimit = parseInt(limit);
        const safeOffset = parseInt(offset);

        const applications = await db.queryAll(
            `SELECT * FROM tbl_job_applications WHERE ${where} ${orderby} LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            params
        );

        const countResult = await db.queryAll(
            `SELECT COUNT(*) as total FROM tbl_job_applications WHERE ${where}`,
            params
        );
        const total = countResult[0] ? countResult[0].total : 0;

        res.json({
            applications,
            total,
            page: parseInt(page),
            limit: safeLimit
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['new', 'reviewed', 'interviewed', 'rejected', 'hired'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await db.update('tbl_job_applications', { status, updated_at: new Date() }, 'id = ?', [id]);

        if (result.affected_rows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createJob,
    updateJob,
    deleteJob,
    getJobs,
    getJobById,
    submitApplication,
    getApplications,
    updateApplicationStatus
};