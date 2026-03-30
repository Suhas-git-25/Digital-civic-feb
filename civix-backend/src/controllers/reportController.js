const Petition = require("../models/petition");
const Signature = require("../models/signature");
const Poll = require("../models/poll");
const Vote = require("../models/vote");
const AdminLog = require("../models/adminLog");
const { Parser } = require("json2csv");

const getAggregatedData = async (options) => {
  const { startDate, endDate, location } = options;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const petitionMatch = { location };
  if (Object.keys(dateFilter).length > 0) {
    petitionMatch.createdAt = dateFilter;
  }

  // Petitions per status
  const petitionsByStatus = await Petition.aggregate([
    { $match: petitionMatch },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Signatures per petition
  const signaturesByPetition = await Petition.aggregate([
    { $match: petitionMatch },
    {
      $lookup: {
        from: "signatures",
        localField: "_id",
        foreignField: "petition",
        as: "signatures",
      },
    },
    {
      $project: {
        title: 1,
        signatureCount: { $size: "$signatures" },
      },
    },
  ]);

  const totalSignatures = signaturesByPetition.reduce(
    (acc, curr) => acc + curr.signatureCount,
    0
  );

  // Poll votes per location
  const pollMatch = { targetLocation: location };
  if (Object.keys(dateFilter).length > 0) {
    pollMatch.createdAt = dateFilter;
  }

  const votesByPoll = await Poll.aggregate([
    { $match: pollMatch },
    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "poll",
        as: "votes",
      },
    },
    {
      $project: {
        title: 1,
        voteCount: { $size: "$votes" },
      },
    },
  ]);

  const totalVotes = votesByPoll.reduce(
    (acc, curr) => acc + curr.voteCount,
    0
  );

  // Petitions by month
  const petitionsByMonth = await Petition.aggregate([
    { $match: petitionMatch },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return {
    petitionsByStatus,
    totalSignatures,
    totalVotes,
    petitionsByMonth,
    signaturesByPetition,
    votesByPoll,
  };
};

// GENERATE REPORTS
exports.generateReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let location = req.query.location || req.user.location;

    if (
      req.user.role === "official" &&
      location !== req.user.location
    ) {
      return res.status(403).json({
        message: "You can only view reports for your own location",
      });
    }

    const data = await getAggregatedData({
      startDate,
      endDate,
      location,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("generateReports error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating reports",
    });
  }
};

// EXPORT REPORTS (CSV)
exports.exportReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let location = req.query.location || req.user.location;

    if (
      req.user.role === "official" &&
      location !== req.user.location
    ) {
      return res.status(403).json({
        message: "You can only export reports for your own location",
      });
    }

    const data = await getAggregatedData({
      startDate,
      endDate,
      location,
    });

    const formatted = [
      ...data.petitionsByStatus.map((s) => ({
        Type: "Petition Status",
        Category: s._id,
        Count: s.count,
      })),
      {
        Type: "Totals",
        Category: "Total Signatures",
        Count: data.totalSignatures,
      },
      {
        Type: "Totals",
        Category: "Total Votes",
        Count: data.totalVotes,
      },
    ];

    const parser = new Parser();
    const csv = parser.parse(formatted);

    await AdminLog.create({
      action: `Exported report data for location ${location}`,
      user: req.user._id,
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`report-${location}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("exportReports error:", error);
    res.status(500).json({
      success: false,
      message: "Server error exporting reports",
    });
  }
};