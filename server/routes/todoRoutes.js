const express = require("express");
const passport = require("passport");
const router = express.Router();
const Todo = require("../models/todo");
const todoController = require("../controllers/todoController");
const { authenticateToken } = require("../middleware/auth");
const { apiLimiter, createTodoLimiter } = require("../middleware/rateLimiter");

// Middleware untuk memastikan user sudah login
const isAuthenticated = passport.authenticate("jwt", { session: false });

// Apply rate limiting to all routes
router.use(apiLimiter);

// Get all todos for current user
router.get("/", authenticateToken, todoController.getAllTodos);

// Get todo by ID
router.get("/:id", authenticateToken, todoController.getTodoById);

// Get todo statistics
router.get("/stats/summary", authenticateToken, todoController.getTodoStats);

// Create new todo (with specific rate limiting)
router.post(
  "/",
  authenticateToken,
  createTodoLimiter,
  todoController.createTodo
);

// Update todo
router.put("/:id", authenticateToken, todoController.updateTodo);

// Update todo status only
router.patch("/:id/status", authenticateToken, todoController.updateTodoStatus);

// Delete todo
router.delete("/:id", authenticateToken, todoController.deleteTodo);

module.exports = router;
