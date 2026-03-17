const Poll = require('../models/poll');
const Vote = require('../models/vote');
const mongoose = require('mongoose');

// Create a new poll (Official/Admin only)
exports.createPoll = async (req, res) => {
  try {
    const { title, options, targetLocation } = req.body;

    if (!title || !options || !targetLocation) {
      return res.status(400).json({ message: 'Title, options, and targetLocation are required.' });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'A poll must have at least 2 options.' });
    }

    const poll = new Poll({
      title,
      options,
      targetLocation,
      createdBy: req.user._id
    });

    await poll.save();
    
    // Logging poll creation
    console.log(`[POLL CREATED] User ${req.user._id} created poll ${poll._id}`);
    
    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Server error while creating poll.', error: error.message });
  }
};

// Get polls (Filtered by location & optionally pagination)
exports.getPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let filter = {};

    // Poll visibility based on location
    if (req.user && req.user.location) {
      filter.targetLocation = { $regex: new RegExp(req.user.location, 'i') };
    }
    
    // Allow query override if needed, but enforce user's location as a base
    if (req.query.location) {
       filter.targetLocation = { $regex: new RegExp(req.query.location, 'i') };
    }

    const polls = await Poll.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Poll.countDocuments(filter);

    res.status(200).json({
      polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ message: 'Server error while fetching polls.', error: error.message });
  }
};

// Get specific poll by ID with aggregated vote counts
exports.getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Poll ID format.' });
    }

    const poll = await Poll.findById(id).populate('createdBy', 'name');
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    // Aggregation pipeline to get vote counts and percentages
    const voteStats = await Vote.aggregate([
      { $match: { poll: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
    ]);

    const totalVotes = await Vote.countDocuments({ poll: id });

    const results = poll.options.map(option => {
      const stat = voteStats.find(v => v._id === option);
      const count = stat ? stat.count : 0;
      const percentage = totalVotes === 0 ? 0 : ((count / totalVotes) * 100).toFixed(2);
      return { option, count, percentage };
    });

    res.status(200).json({
      poll,
      results,
      totalVotes
    });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ message: 'Server error while fetching poll details.', error: error.message });
  }
};

// Vote on a poll (Citizen only)
exports.voteOnPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Poll ID format.' });
    }

    if (!selectedOption) {
      return res.status(400).json({ message: 'Selected option is required.' });
    }

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    // Sanitize and validate option
    if (!poll.options.includes(selectedOption.trim())) {
      return res.status(400).json({ message: 'Invalid option selected.' });
    }

    // Attempt to create a vote. Duplicate index on 'poll' and 'user' will prevent duplicate voting at DB level.
    const vote = new Vote({
      poll: id,
      user: req.user._id,
      selectedOption: selectedOption.trim()
    });

    await vote.save();
    
    // Logging vote
    console.log(`[VOTE CAST] User ${req.user._id} voted on poll ${id} for option ${selectedOption}`);

    res.status(201).json({ message: 'Vote recorded successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error code
      return res.status(400).json({ message: 'You have already voted on this poll.' });
    }
    console.error('Error casting vote:', error);
    res.status(500).json({ message: 'Server error while casting vote.', error: error.message });
  }
};
