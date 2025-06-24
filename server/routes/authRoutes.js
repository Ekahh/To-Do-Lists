const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Google OAuth login route
router.get("/google", authController.googleLogin);

// Google OAuth callback route
router.get("/google/callback", authController.googleCallback);

// Get JWT token for Postman testing
router.post("/token", authController.getToken);

// Get current user
router.get("/me", authenticateToken, authController.getCurrentUser);

// Logout route
router.get("/logout", authController.logout);

module.exports = router;
