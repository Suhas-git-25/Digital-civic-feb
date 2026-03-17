const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const pollController = require('../controllers/pollController');
const { protect } = require('../middleware/authMiddleware');
const { isCitizen, isOfficial, isAdmin } = require('../middleware/roleMiddleware');

// Voting rate limit to prevent manipulation
const voteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 vote POST requests per windowMs
  message: { message: 'Too many voting attempts from this IP, please try again after 15 minutes' }
});

// Middleware to authorize either Official or Admin
const isOfficialOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'official' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Official or Admin role required.' });
  }
};

// POST /api/polls - Create poll (Official/Admin only)
router.post('/', protect, isOfficialOrAdmin, pollController.createPoll);

// GET /api/polls - Fetch polls (All authenticated users can see polls relevant to them)
router.get('/', protect, pollController.getPolls);

// GET /api/polls/:id - Fetch specific poll details
router.get('/:id', protect, pollController.getPollById);

// POST /api/polls/:id/vote - Vote on a poll (Citizen only, rate limited)
router.post('/:id/vote', protect, voteRateLimiter, isCitizen, pollController.voteOnPoll);

module.exports = router;
