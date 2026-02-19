const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  submitApplication,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  updateApplicationStatus
} = require('../controller/jobController');

const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getJobs); // GET /api/jobs
router.get('/:id', getJobById); // GET /api/jobs/:id
router.post('/apply', submitApplication); // POST /api/jobs/apply

// Admin routes (protected)
router.post('/', authenticateToken, isAdmin, createJob); // POST /api/jobs
router.put('/:id', authenticateToken, isAdmin, updateJob); // PUT /api/jobs/:id
router.delete('/:id', authenticateToken, isAdmin, deleteJob); // DELETE /api/jobs/:id
router.get('/:job_id/applications', authenticateToken, isAdmin, getApplications); // GET /api/jobs/:job_id/applications
router.put('/applications/:id/status', authenticateToken, isAdmin, updateApplicationStatus); // PUT /api/jobs/applications/:id/status

module.exports = router;
