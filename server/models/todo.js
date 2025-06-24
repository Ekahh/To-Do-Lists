const pool = require("../config/database");

class Todo {
  static async findByUserId(userId, status = null) {
    try {
      let query = "SELECT * FROM todos WHERE user_id = ?";
      let params = [userId];

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY priority DESC, deadline ASC, created_at DESC";

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error in findByUserId:", error);
      throw error;
    }
  }

  static async findById(id, userId = null) {
    try {
      let query = "SELECT * FROM todos WHERE id = ?";
      let params = [id];

      if (userId) {
        query += " AND user_id = ?";
        params.push(userId);
      }

      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      console.error("Error in findById:", error);
      throw error;
    }
  }

  static async create({ title, description, deadline, priority, userId }) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO todos (title, description, deadline, priority, user_id) VALUES (?, ?, ?, ?, ?)",
        [title, description, deadline, priority || "medium", userId]
      );

      const newTodo = await this.findById(result.insertId);
      return newTodo;
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  }

  static async update(
    id,
    { title, description, deadline, priority, status },
    userId = null
  ) {
    try {
      let query =
        "UPDATE todos SET title = ?, description = ?, deadline = ?, priority = ?, status = ? WHERE id = ?";
      let params = [title, description, deadline, priority, status, id];

      if (userId) {
        query += " AND user_id = ?";
        params.push(userId);
      }

      const [result] = await pool.execute(query, params);

      if (result.affectedRows === 0) {
        throw new Error("Todo not found or unauthorized");
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  static async updateStatus(id, status, userId) {
    try {
      const [result] = await pool.execute(
        "UPDATE todos SET status = ? WHERE id = ? AND user_id = ?",
        [status, id, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error("Todo not found or unauthorized");
      }

      return await this.findById(id);
    } catch (error) {
      console.error("Error in updateStatus:", error);
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM todos WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      if (result.affectedRows === 0) {
        throw new Error("Todo not found or unauthorized");
      }

      return true;
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  }

  static async getStats(userId) {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          status,
          COUNT(*) as count
        FROM todos 
        WHERE user_id = ?
        GROUP BY status
      `,
        [userId]
      );

      const stats = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        total: 0,
      };

      rows.forEach((row) => {
        stats[row.status] = row.count;
        stats.total += row.count;
      });

      return stats;
    } catch (error) {
      console.error("Error in getStats:", error);
      throw error;
    }
  }
}

module.exports = Todo;
