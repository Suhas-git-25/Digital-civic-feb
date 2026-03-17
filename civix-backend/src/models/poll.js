const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetLocation: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Prevent polls with less than 2 options at the DB level
pollSchema.pre('save', function (next) {
  if (this.options && this.options.length < 2) {
    return next(new Error('A poll must have at least 2 options.'));
  }
  next();
});

module.exports = mongoose.model('Poll', pollSchema);
