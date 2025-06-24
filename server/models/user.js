const pool = require("../config/database");

class User {
  static async findById(id) {
    try {
      console.log("🔍 Finding user by ID:", id);
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [
        id,
      ]);
      const user = rows[0];
      console.log("🔍 User found:", user ? `ID: ${user.id}` : "Not found");
      return user;
    } catch (error) {
      console.error("❌ Error in findById:", error);
      throw error;
    }
  }

  static async findOne(conditions) {
    try {
      console.log("🔍 Finding user with conditions:", conditions);
      let query = "SELECT * FROM users WHERE ";
      let params = [];

      if (conditions.google_id) {
        query += "google_id = ?";
        params.push(conditions.google_id);
      } else if (conditions.email) {
        query += "email = ?";
        params.push(conditions.email);
      } else {
        throw new Error("No valid search condition provided");
      }

      console.log("🔍 Executing query:", query, "with params:", params);
      const [rows] = await pool.execute(query, params);
      const user = rows[0];
      console.log("🔍 User found:", user ? `ID: ${user.id}` : "Not found");
      return user;
    } catch (error) {
      console.error("❌ Error in findOne:", error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      console.log("👤 Creating user with data:", userData);

      // Ensure we have required fields
      if (!userData.googleId || !userData.email) {
        throw new Error("Missing required fields: googleId and email");
      }

      const [result] = await pool.execute(
        "INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)",
        [
          userData.googleId,
          userData.email,
          userData.name || "",
          userData.picture || "",
        ]
      );

      console.log("✅ User created with ID:", result.insertId);

      // Return the created user
      const newUser = {
        id: result.insertId,
        google_id: userData.googleId,
        email: userData.email,
        name: userData.name || "",
        picture: userData.picture || "",
      };

      return newUser;
    } catch (error) {
      console.error("❌ Error in create:", error);

      // Handle duplicate entry error
      if (error.code === "ER_DUP_ENTRY") {
        console.log("🔍 Duplicate entry, trying to find existing user...");
        const existingUser = await this.findOne({
          google_id: userData.googleId,
        });
        if (existingUser) {
          console.log("✅ Found existing user:", existingUser.id);
          return existingUser;
        }
      }

      throw error;
    }
  }

  static async updateLastLogin(id) {
    try {
      await pool.execute(
        "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );
    } catch (error) {
      console.error("❌ Error updating last login:", error);
      // Don't throw error as this is not critical
    }
  }
}

module.exports = User;
