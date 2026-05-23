const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  getActivityLogs
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Important: Put specific routes BEFORE parameterized routes to avoid collision
router.get('/stats', protect, getLeadStats);
router.get('/activities', protect, getActivityLogs);

// General CRUD
router.route('/')
  .post(protect, createLead)
  .get(protect, getLeads);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

module.exports = router;
