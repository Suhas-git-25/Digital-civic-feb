const isCitizen = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No user data found",
      });
    }

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Citizen role required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role middleware error",
    });
  }
};

const isOfficial = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No user data found",
      });
    }

    if (req.user.role !== "official") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Official role required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role middleware error",
    });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No user data found",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Role middleware error",
    });
  }
};

module.exports = { isCitizen, isOfficial, isAdmin };
