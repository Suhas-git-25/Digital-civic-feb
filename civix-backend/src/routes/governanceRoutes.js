const express = require("express");
const router = express.Router();

const {
  getPetitionsForOfficial,
  respondToPetition,
} = require("../controllers/governanceController");

const { protect } = require("../middleware/authMiddleware");
const { isOfficial } = require("../middleware/roleMiddleware");

const rateLimit = require("express-rate-limit");

// Rate limiting for responses to prevent spam
const responseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  message:
    "Too many responses created from this IP, please try again after 15 minutes",
});

// All governance routes require authentication + official role
router.use(protect);
router.use(isOfficial);

// Routes
router.get("/petitions", getPetitionsForOfficial);
router.post(
  "/petitions/:id/respond",
  responseLimiter,
  respondToPetition
);

module.exports = router;