const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_app",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  queueLimit: 0,
  reconnect: true,
  idleTimeout: 300000,
  maxIdle: 10,
});

// Test connection and wait for database to be ready
const waitForDatabase = async (maxRetries = 30, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("Database connected successfully");
      connection.release();
      return true;
    } catch (error) {
      console.log(
        `Database connection attempt ${i + 1}/${maxRetries} failed:`,
        error.message
      );
      if (i === maxRetries - 1) {
        console.error("Failed to connect to database after maximum retries");
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Initialize database tables
const initDatabase = async () => {
  try {
    // Wait for database to be ready
    await waitForDatabase();

    // Create database if not exists (though it should exist from docker-compose)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "todo_app"}`
    );
    await connection.end();

    // Create users table - EXACTLY matching your model expectations
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create todos table - EXACTLY matching your model expectations
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        deadline DATETIME,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status),
        INDEX idx_deadline (deadline)
      )
    `);

    console.log("✅ Database tables initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};

// Initialize database when module loads
const initializeDatabase = async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Exit if database initialization fails
    process.exit(1);
  }
};

// Call initialization
initializeDatabase();

module.exports = pool;
