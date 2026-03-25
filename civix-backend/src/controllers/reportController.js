const Petition = require("../models/petition");
const { Parser } = require("json2csv");

//  GET REPORTS (AGGREGATED DATA)
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {
      location: req.user.location, // restrict by official location
    };

    //  Date filter
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    //  Aggregation
    const reports = await Petition.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: "$status", // active / under_review / closed
          count: { $sum: 1 },
          totalSignatures: { $sum: { $size: "$signatures" } },
        },
      },
    ]);

    res.json({
      success: true,
      data: reports,
    });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate reports",
    });
  }
};

// EXPORT REPORTS (CSV DOWNLOAD)
exports.exportReports = async (req, res) => {
  try {
    const data = await Petition.find({
      location: req.user.location, // 🔒 restrict by location
    });

    // Format data
    const formatted = data.map((p) => ({
      Title: p.title,
      Status: p.status,
      Signatures: p.signatures.length,
      CreatedAt: p.createdAt,
      Response: p.officialResponse || "N/A",
    }));

    //  Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(formatted);

    //  Send file
    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    res.send(csv);

  } catch (err) {
    console.error("Export Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to export report",
    });
  }
};