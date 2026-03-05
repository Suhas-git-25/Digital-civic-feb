const express = require('express');
const router = express.Router();
const {
    createPetition,
    getPetitions,
    getPetitionById,
    signPetition,
    updatePetition,
    deletePetition
} = require('../controllers/petitionController');
const { protect } = require('../middleware/authMiddleware');
const { isCitizen, isOfficial } = require('../middleware/roleMiddleware');

// Optional auth middleware
const optionalAuth = (req, res, next) => {
    protect(req, res, (err) => {
        // We ignore errors and just continue, the user will just remain undefined if no valid token
        if (err) return next();
        next();
    }).catch(() => next());
};

// Custom middleware to optionally extract user without failing if not logged in
const optionalProtect = async (req, res, next) => {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const jwt = require('jsonwebtoken');
            const User = require('../models/user');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (error) {
        // Ignore token errors, req.user flag will just remain unset
    }
    next();
};


router.post('/', protect, isCitizen, createPetition);
router.get('/', optionalProtect, getPetitions);
router.get('/:id', optionalProtect, getPetitionById);
router.put('/:id', protect, isCitizen, updatePetition);
router.delete('/:id', protect, isCitizen, deletePetition);
router.post('/:id/sign', protect, isCitizen, signPetition);

module.exports = router;
