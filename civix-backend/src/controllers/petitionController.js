const Petition = require('../models/petition');
const Signature = require('../models/signature');

// @desc    Create a new petition
// @route   POST /api/petitions
// @access  Private (Citizen only)
exports.createPetition = async (req, res) => {
    try {
        const { title, description, category, location } = req.body;

        // Validate input fields
        if (!title || !description || !category || !location) {
            return res.status(400).json({ message: 'Please provide all required fields: title, description, category, location' });
        }

        const petition = new Petition({
            title,
            description,
            category,
            location,
            creator: req.user._id,
            status: 'under_review' // Default status
        });

        const savedPetition = await petition.save();
        res.status(201).json(savedPetition);
    } catch (error) {
        console.error('Error creating petition:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all petitions / filter petitions
// @route   GET /api/petitions
// @access  Public (Behavior changes based on auth role)
exports.getPetitions = async (req, res) => {
    try {
        const { location, category, status, user: creatorId, page = 1, limit = 10 } = req.query;

        // Build query object
        const query = {};

        // Base filtering from query params
        if (location) query.location = location;
        if (category) query.category = category;
        if (status) query.status = status;
        if (creatorId) query.creator = creatorId;

        // Role & Location-based access control
        if (req.user && req.user.role === 'official') {
            // Officials can view petitions only in their location
            query.location = req.user.location;
        }
        // Citizens and public can view all petitions based on their query filters

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const petitions = await Petition.find(query)
            .populate('creator', 'name email location')
            .populate('signatureCount') // Virtual field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Petition.countDocuments(query);

        res.status(200).json({
            petitions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching petitions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single petition by ID
// @route   GET /api/petitions/:id
// @access  Public
exports.getPetitionById = async (req, res) => {
    try {
        const petition = await Petition.findById(req.params.id)
            .populate('creator', 'name email location')
            .populate('signatureCount'); // Populate the 'signatureCount' virtual field which counts signatures

        if (!petition) {
            return res.status(404).json({ message: 'Petition not found' });
        }

        // Check if current user has signed (requires manual check since virtual is just a count)
        let isSigned = false;
        if (req.user) {
            const signature = await Signature.findOne({ petition: petition._id, user: req.user._id });
            isSigned = !!signature;
        }

        const petitionData = petition.toObject();
        petitionData.isSigned = isSigned;

        res.status(200).json(petitionData);
    } catch (error) {
        console.error('Error fetching petition:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Petition not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a petition
// @route   PUT /api/petitions/:id
// @access  Private (Creator only)
exports.updatePetition = async (req, res) => {
    try {
        let petition = await Petition.findById(req.params.id);

        if (!petition) {
            return res.status(404).json({ message: 'Petition not found' });
        }

        // Make sure user is creator
        if (petition.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this petition' });
        }

        petition = await Petition.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(petition);
    } catch (error) {
        console.error('Error updating petition:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a petition
// @route   DELETE /api/petitions/:id
// @access  Private (Creator only)
exports.deletePetition = async (req, res) => {
    try {
        const petition = await Petition.findById(req.params.id);

        if (!petition) {
            return res.status(404).json({ message: 'Petition not found' });
        }

        // Make sure user is creator
        if (petition.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this petition' });
        }

        // Delete associated signatures first
        await Signature.deleteMany({ petition: req.params.id });
        await petition.deleteOne();

        res.status(200).json({ message: 'Petition removed' });
    } catch (error) {
        console.error('Error deleting petition:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Sign a petition
// @route   POST /api/petitions/:id/sign
// @access  Private (Citizen only)
exports.signPetition = async (req, res) => {
    try {
        const petitionId = req.params.id;
        const userId = req.user._id;

        const petition = await Petition.findById(petitionId);

        // Check if petition exists
        if (!petition) {
            return res.status(404).json({ message: 'Petition not found' });
        }

        // Check if petition status is active
        if (petition.status !== 'active') {
            return res.status(400).json({ message: 'You can only sign active petitions' });
        }

        // Check for duplicate signature
        const existingSignature = await Signature.findOne({ petition: petitionId, user: userId });
        if (existingSignature) {
            return res.status(400).json({ message: 'You have already signed this petition' });
        }

        // Save signature record
        const signature = new Signature({
            petition: petitionId,
            user: userId
        });

        await signature.save();

        res.status(201).json({ message: 'Successfully signed the petition', signature });
    } catch (error) {
        console.error('Error signing petition:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
