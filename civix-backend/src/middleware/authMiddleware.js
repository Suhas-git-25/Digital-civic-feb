const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  try {
    //  1. Get token from cookies
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    //  2. Get token from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //  No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    //  3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Safety check (important)
    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    //  4. Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      location: decoded.location,
    };

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = { protect };
