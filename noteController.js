const Note = require('../models/Note');
const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

// Helper to log activities
const logActivity = async (leadId, action, description) => {
  try {
    await ActivityLog.create({ leadId, action, description });
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

// @desc    Add a note to a lead
// @route   POST /api/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { leadId, note } = req.body;

    if (!leadId || !note) {
      return res.status(400).json({ success: false, message: 'leadId and note content are required' });
    }

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const newNote = await Note.create({
      leadId,
      note,
      author: req.admin ? req.admin.username : 'Admin',
    });

    // Log this activity
    await logActivity(
      leadId,
      'Note Added',
      `Internal note added to lead "${lead.name}": "${note.substring(0, 40)}${note.length > 40 ? '...' : ''}"`
    );

    return res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notes for a lead
// @route   GET /api/notes/lead/:leadId
// @access  Private
const getNotesByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const notes = await Note.find({ leadId }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addNote,
  getNotesByLeadId,
};
