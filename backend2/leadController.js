const Lead = require('../models/Lead');
const Note = require('../models/Note');
const ActivityLog = require('../models/ActivityLog');

// Helper to log activities
const logActivity = async (leadId, action, description) => {
  try {
    await ActivityLog.create({ leadId, action, description });
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, followUpDate } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required fields' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company: company || '',
      source: source || 'Website',
      status: status || 'New',
      followUpDate: followUpDate || null,
      followUpCompleted: false,
    });

    await logActivity(
      lead._id,
      'Lead Created',
      `Lead "${lead.name}" was manually created from source "${lead.source}".`
    );

    return res.status(201).json({ success: true, data: lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leads with filtering, searching, and sorting
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const { status, source, search, sort } = req.query;
    const query = {};

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by source
    if (source && source !== 'All') {
      query.source = source;
    }

    // Search by Name, Email, Phone or Company
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 }; // default newest first
    if (sort) {
      if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
      } else if (sort === 'name_asc') {
        sortOption = { name: 1 };
      } else if (sort === 'name_desc') {
        sortOption = { name: -1 };
      }
    }

    const leads = await Lead.find(query).sort(sortOption);

    return res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, status, followUpDate, followUpCompleted } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Track status change for logs
    const statusChanged = status && status !== lead.status;
    const followUpCompletedChanged = followUpCompleted !== undefined && followUpCompleted !== lead.followUpCompleted;

    // Apply updates
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (source) lead.source = source;
    if (status) lead.status = status;
    if (followUpDate !== undefined) lead.followUpDate = followUpDate;
    if (followUpCompleted !== undefined) lead.followUpCompleted = followUpCompleted;

    const updatedLead = await lead.save();

    // Log updates
    if (statusChanged) {
      await logActivity(
        lead._id,
        'Status Changed',
        `Lead status updated from "${lead.status}" to "${status}".`
      );
    }
    if (followUpCompletedChanged) {
      const actionStr = followUpCompleted ? 'Follow-Up Completed' : 'Follow-Up Pending';
      await logActivity(
        lead._id,
        actionStr,
        `Follow-up task was marked as ${followUpCompleted ? 'completed' : 'pending'}.`
      );
    }

    return res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Delete lead
    await Lead.deleteOne({ _id: req.params.id });

    // Cascade delete associated notes
    await Note.deleteMany({ leadId: req.params.id });

    // Cascade delete activity logs
    await ActivityLog.deleteMany({ leadId: req.params.id });

    // Log global deletion
    await logActivity(
      null,
      'Lead Deleted',
      `Lead "${lead.name}" and all related data was permanently removed.`
    );

    return res.status(200).json({ success: true, message: 'Lead successfully deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & source breakdown statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const convertedLeads = await Lead.countDocuments({ status: 'Converted' });
    
    // Count pending followups where followUpDate is set and followUpCompleted is false
    const pendingFollowups = await Lead.countDocuments({
      followUpDate: { $ne: null },
      followUpCompleted: false
    });

    // Lead source distribution
    const sourceStats = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Format source distribution stats for easy charts reading
    const sources = ['Website', 'Instagram', 'LinkedIn', 'Referral', 'Other'];
    const sourceBreakdown = sources.map(src => {
      const found = sourceStats.find(s => s._id === src);
      return {
        name: src,
        value: found ? found.count : 0
      };
    });

    // Month-by-month lead volume (last 6 months) for advanced visualization
    const leadTrend = await Lead.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        newLeads,
        convertedLeads,
        pendingFollowups,
        sourceBreakdown,
        leadTrend: leadTrend.reverse().map(item => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            month: `${months[item._id.month - 1]} ${item._id.year}`,
            leads: item.count
          };
        })
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all activity logs
// @route   GET /api/leads/activities
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('leadId', 'name')
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  getActivityLogs
};
