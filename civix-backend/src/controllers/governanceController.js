const Petition = require("../models/Petition");
const AdminLog = require("../models/AdminLog");

//  GET PETITIONS (OFFICIAL)
exports.getPetitions = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {
      location: req.user.location, // restrict by location
    };

    if (status) {
      filter.status = status;
    }

    const petitions = await Petition.find(filter).populate("respondedBy", "name");

    res.json(petitions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  RESPOND TO PETITION
exports.respondToPetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    const petition = await Petition.findById(id);

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    //  LOCATION SECURITY
    if (petition.location !== req.user.location) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    petition.officialResponse = response;
    petition.status = status;
    petition.respondedBy = req.user._id;
    petition.respondedAt = new Date();

    await petition.save();

    //  LOG ACTION
    await AdminLog.create({
      action: "Responded to petition",
      user: req.user._id,
      petition: petition._id,
    });

    res.json({ message: "Response submitted successfully", petition });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};