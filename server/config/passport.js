const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google profile received:", {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
        });

        // Cek apakah user sudah ada berdasarkan google_id
        let user = await User.findOne({ google_id: profile.id });
        console.log("🔍 Existing user found:", user ? "Yes" : "No");

        if (!user) {
          // Jika user belum ada, buat user baru
          console.log("👤 Creating new user...");
          user = await User.create({
            googleId: profile.id, // This will be mapped to google_id in the create method
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName || "Unknown User",
            picture: profile.photos?.[0]?.value || "",
          });
          console.log("✅ New user created:", user);
        } else {
          console.log("✅ Existing user logged in:", user);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      console.log("🔍 JWT payload:", payload);
      const user = await User.findById(payload.id);
      if (user) {
        console.log("✅ JWT user found:", user.id);
        return done(null, user);
      }
      console.log("❌ JWT user not found");
      return done(null, false);
    } catch (error) {
      console.error("❌ Error in JWT Strategy:", error);
      return done(error, false);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("📝 Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔍 Deserializing user ID:", id);
    const user = await User.findById(id);
    if (user) {
      console.log("✅ User deserialized:", user.id);
      done(null, user);
    } else {
      console.log("❌ User not found during deserialization");
      done(null, false);
    }
  } catch (error) {
    console.error("❌ Error in deserializeUser:", error);
    done(error, null);
  }
});

module.exports = passport;
