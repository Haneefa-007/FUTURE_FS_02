const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public (Can be restricted/disabled in production)
const registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // Check if admin already exists
    const adminExists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin username or email already exists' });
    }

    // Create Admin
    const admin = await Admin.create({
      username,
      email,
      password,
    });

    if (admin) {
      return res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all login credentials' });
    }

    // Find admin by email or username
    const admin = await Admin.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged in admin details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getMe,
};
