const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedOption: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Prevent duplicate voting by creating a compound index
voteSchema.index({ poll: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
