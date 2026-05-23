const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    note: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      trim: true,
    },
    author: {
      type: String,
      default: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
