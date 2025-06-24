const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    console.log("🔍 Auth middleware - Token present:", !!token);

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        error: "Access token required",
        code: "NO_TOKEN",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Token decoded for user:", decoded.id);

    // Get user from database to ensure they still exist
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("❌ User not found in database:", decoded.id);
      return res.status(401).json({
        error: "Invalid token - user not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Attach user to request object
    req.user = user;
    console.log("✅ User authenticated:", user.id);

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(500).json({
      error: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    req.user = user || null;
    next();
  } catch (error) {
    console.warn("⚠️ Optional auth failed:", error.message);
    req.user = null;
    next();
  }
};

// Admin check middleware (if you need it later)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
};
