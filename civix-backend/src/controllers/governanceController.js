const Petition = require('../models/petition');
const AdminLog = require('../models/adminLog');

exports.getPetitionsForOfficial = async (req, res) => {
    try {
        const { status } = req.query;
        // Official can only see petitions from their location
        const location = req.user.location;
        
        if (!location) {
            return res.status(403).json({ message: 'Official location not set' });
        }

        const filter = { location };
        if (status) {
            filter.status = status;
        }

        const petitions = await Petition.find(filter).sort({ createdAt: -1 });

        res.json(petitions);
    } catch (error) {
        console.error('getPetitionsForOfficial error:', error);
        res.status(500).json({ message: 'Server error retrieving petitions' });
    }
};

exports.respondToPetition = async (req, res) => {
    try {
        const { id } = req.params;
        const { response, status } = req.body;
        const official = req.user;

        if (!response || !status) {
            return res.status(400).json({ message: 'Response text and status are required' });
        }

        const petition = await Petition.findById(id);
        if (!petition) {
            return res.status(404).json({ message: 'Petition not found' });
        }

        // Prevent cross-location access
        if (petition.location !== official.location) {
            return res.status(403).json({ message: 'You can only respond to petitions in your location' });
        }

        const validStatuses = ['active', 'under_review', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        petition.officialResponse = response;
        petition.status = status;
        petition.respondedBy = official._id;
        petition.respondedAt = new Date();

        await petition.save();

        // Log action
        await AdminLog.create({
            action: `Responded to petition: updated status to ${status}`,
            user: official._id,
            petition: petition._id
        });

        res.json({ message: 'Response submitted successfully', petition });
    } catch (error) {
        console.error('respondToPetition error:', error);
        res.status(500).json({ message: 'Server error responding to petition' });
    }
};
