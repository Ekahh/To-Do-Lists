    const mysql = require("mysql2/promise");

    const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "todo_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    });

    // Test database connection
    const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Database connected successfully");
        connection.release();
    } catch (err) {
        console.error("Error connecting to the database:", err);
        process.exit(1); // Exit if cannot connect to database
    }
    };

    testConnection();

    module.exports = pool;
