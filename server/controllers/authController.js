const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authController = {
  // Google OAuth login route
  googleLogin: (req, res, next) => {
    console.log("🚀 Starting Google OAuth login...");
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account", // Force account selection
    })(req, res, next);
  },

  // Google OAuth callback
  googleCallback: (req, res, next) => {
    console.log("🔄 Google OAuth callback triggered");

    passport.authenticate(
      "google",
      {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
      },
      async (err, user, info) => {
        try {
          console.log("🔍 Google callback result:", {
            err: !!err,
            user: !!user,
            info,
          });

          if (err) {
            console.error("❌ Authentication error:", err);
            return res.redirect(
              `${process.env.CLIENT_URL}/login?error=auth_error`
            );
          }

          if (!user) {
            console.error("❌ No user returned from Google authentication");
            return res.redirect(
              `${process.env.CLIENT_URL}/login?error=no_user`
            );
          }

          console.log("✅ User authenticated successfully:", {
            id: user.id,
            email: user.email,
            name: user.name,
          });

          // Update last login timestamp
          try {
            await User.updateLastLogin(user.id);
          } catch (updateError) {
            console.warn(
              "⚠️ Failed to update last login:",
              updateError.message
            );
            // Don't fail the auth process for this
          }

          // Generate JWT token
          const tokenPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            google_id: user.google_id,
          };

          const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: "7d",
            issuer: "todo-app",
            audience: "todo-app-users",
          });

          console.log("✅ JWT token generated for user:", user.id);

          // Redirect to frontend with token
          const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
          const redirectUrl = `${clientUrl}/auth/callback?token=${encodeURIComponent(
            token
          )}`;

          console.log("🔄 Redirecting to:", redirectUrl);
          return res.redirect(redirectUrl);
        } catch (error) {
          console.error("❌ Error in Google callback handler:", error);
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=callback_error`
          );
        }
      }
    )(req, res, next);
  },

  // Get JWT token (for Postman testing)
  getToken: async (req, res) => {
    try {
      const { email, google_id } = req.body;

      if (!email && !google_id) {
        return res.status(400).json({
          error: "Email or Google ID is required",
        });
      }

      // Find user
      const user = await User.findOne({
        email: email,
        google_id: google_id,
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      console.log("🔍 Getting current user for ID:", req.user?.id);

      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get fresh user data from database
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("❌ Error getting current user:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Logout
  logout: (req, res) => {
    console.log("👋 User logged out");

    // Since we're using JWT, we just return success
    // The client should remove the token from storage
    res.json({
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    });
  },

  // Health check for auth system
  healthCheck: (req, res) => {
    const health = {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: {
        googleClientId: process.env.GOOGLE_CLIENT_ID
          ? "✅ Configured"
          : "❌ Missing",
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
          ? "✅ Configured"
          : "❌ Missing",
        jwtSecret: process.env.JWT_SECRET ? "✅ Configured" : "❌ Missing",
        clientUrl: process.env.CLIENT_URL || "❌ Not set",
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || "❌ Not set",
      },
    };

    res.json(health);
  },
};

module.exports = authController;
