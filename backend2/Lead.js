const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a contact name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'LinkedIn', 'Referral', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'],
      default: 'New',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
