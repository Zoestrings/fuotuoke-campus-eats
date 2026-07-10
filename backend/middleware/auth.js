// Auth verification and role guard middlewares

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Checks Authorization header for Bearer token and binds user to req.user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found. Token invalid." });
    }
    if (user.status !== "active") {
      return res.status(403).json({ error: "Account suspended. Contact admin." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

// Guard route by checking user role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
