const express = require('express');
const router = express.Router();
const { addNote, getNotesByLeadId } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addNote);
router.get('/lead/:leadId', protect, getNotesByLeadId);

module.exports = router;
