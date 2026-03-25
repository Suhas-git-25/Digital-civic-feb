const Petition = require('../models/petition');
const Signature = require('../models/signature');
const Poll = require('../models/poll');
const Vote = require('../models/vote');
const AdminLog = require('../models/adminLog');

const getAggregatedData = async (options) => {
    const { startDate, endDate, location } = options;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Petitions match conditions
    const petitionMatch = { location };
    if (Object.keys(dateFilter).length > 0) petitionMatch.createdAt = dateFilter;

    // 1. Petitions per status
    const petitionsByStatus = await Petition.aggregate([
        { $match: petitionMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Signatures per petition in location
    const signaturesByPetition = await Petition.aggregate([
        { $match: petitionMatch },
        { $lookup: { from: 'signatures', localField: '_id', foreignField: 'petition', as: 'signatures' } },
        { $project: { title: 1, signatureCount: { $size: '$signatures' } } }
    ]);
    
    const totalSignatures = signaturesByPetition.reduce((acc, curr) => acc + curr.signatureCount, 0);

    // 3. Poll votes per location
    const pollMatch = { targetLocation: location };
    if (Object.keys(dateFilter).length > 0) pollMatch.createdAt = dateFilter;

    // Join votes to polls
    const votesByPoll = await Poll.aggregate([
        { $match: pollMatch },
        { $lookup: { from: 'votes', localField: '_id', foreignField: 'poll', as: 'votes' } },
        { $project: { title: 1, voteCount: { $size: '$votes' } } }
    ]);
    
    const totalVotes = votesByPoll.reduce((acc, curr) => acc + curr.voteCount, 0);

    // 4. Monthly grouping logic (Petitions created by month)
    const petitionsByMonth = await Petition.aggregate([
        { $match: petitionMatch },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return {
        petitionsByStatus,
        totalSignatures,
        totalVotes,
        petitionsByMonth,
        signaturesByPetition,
        votesByPoll
    };
};

exports.generateReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let location = req.query.location || req.user.location;
        
        // Ensure official only queries their own location
        if (req.user.role === 'official' && location !== req.user.location) {
            return res.status(403).json({ message: 'You can only view reports for your own location' });
        }

        const data = await getAggregatedData({ startDate, endDate, location });
        res.json(data);
    } catch (error) {
        console.error('generateReports error:', error);
        res.status(500).json({ message: 'Server error generating reports' });
    }
};

exports.exportReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let location = req.query.location || req.user.location;

        if (req.user.role === 'official' && location !== req.user.location) {
            return res.status(403).json({ message: 'You can only export reports for your own location' });
        }

        const data = await getAggregatedData({ startDate, endDate, location });

        // Generate CSV Data
        const csvRows = [];
        csvRows.push(['Report Type', 'Category/Item', 'Count']);

        // add status
        data.petitionsByStatus.forEach(statusStat => {
            csvRows.push(['Petition Status', statusStat._id, statusStat.count]);
        });
        
        // add total signatures
        csvRows.push(['Totals', 'Total Signatures', data.totalSignatures]);
        
        // add total votes
        csvRows.push(['Totals', 'Total Poll Votes', data.totalVotes]);
        
        // add signatures by petition
        data.signaturesByPetition.forEach(pet => {
            csvRows.push(['Petition Signatures', pet.title.replace(/,/g, ''), pet.signatureCount]);
        });

        // add votes by poll
        data.votesByPoll.forEach(poll => {
            csvRows.push(['Poll Votes', poll.title.replace(/,/g, ''), poll.voteCount]);
        });

        const csvString = csvRows.map(e => e.join(',')).join('\n');

        // Log export action
        await AdminLog.create({
            action: `Exported report data for location ${location}`,
            user: req.user._id
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report-${location}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvString);
    } catch (error) {
        console.error('exportReports error:', error);
        res.status(500).json({ message: 'Server error exporting reports' });
    }
};
