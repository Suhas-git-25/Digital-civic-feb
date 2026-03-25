const express = require('express');
const router = express.Router();
const { generateReports, exportReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { isOfficial } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, // limit to 20 requests
    message: 'Too many report requests, try again later'
});

router.use(protect);
router.use(isOfficial);

router.get('/', reportLimiter, generateReports);
router.get('/export', reportLimiter, exportReports);

module.exports = router;
