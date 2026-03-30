const express = require("express");
const router = express.Router();

const {
  generateReports,
  exportReports,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { isOfficial } = require("../middleware/roleMiddleware");

const rateLimit = require("express-rate-limit");

// Rate limit report generation requests
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: "Too many report requests, try again later",
});

// All report routes require authentication + official role
router.use(protect);
router.use(isOfficial);

// Routes
router.get("/", reportLimiter, generateReports);
router.get("/export", reportLimiter, exportReports);

module.exports = router;