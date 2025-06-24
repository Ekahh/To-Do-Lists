const Todo = require("../models/todo");
const rabbitmq = require("../services/rabbitmq");

exports.getAllTodos = async (req, res) => {
  try {
    const { status } = req.query;
    const todos = await Todo.findByUserId(req.user.id, status);
    res.json(todos);
  } catch (error) {
    console.error("Error in getAllTodos:", error);
    res
      .status(500)
      .json({ message: "Error fetching todos", error: error.message });
  }
};

exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id, req.user.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (error) {
    console.error("Error in getTodoById:", error);
    res
      .status(500)
      .json({ message: "Error fetching todo", error: error.message });
  }
};

exports.createTodo = async (req, res) => {
  try {
    console.log("Creating todo with data:", req.body);
    console.log("User ID:", req.user.id);

    const { title, description, deadline, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate deadline format if provided
    let formattedDeadline = null;
    if (deadline) {
      try {
        const d = new Date(deadline);
        // Format ke 'YYYY-MM-DD HH:MM:SS' (local time)
        formattedDeadline =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0") +
          " " +
          String(d.getHours()).padStart(2, "0") +
          ":" +
          String(d.getMinutes()).padStart(2, "0") +
          ":" +
          String(d.getSeconds()).padStart(2, "0");
      } catch (error) {
        return res.status(400).json({ message: "Invalid deadline format" });
      }
    }

    const todoData = {
      title: title.trim(),
      description: description?.trim() || null,
      deadline: formattedDeadline,
      priority: priority || "medium",
      userId: req.user.id,
    };

    console.log("Processed todo data:", todoData);

    const todo = await Todo.create(todoData);
    console.log("Todo created successfully:", todo);

    // Publish message to RabbitMQ (non-blocking)
    try {
      await rabbitmq.publishMessage("todo.created", {
        todoId: todo.id,
        userId: req.user.id,
        action: "created",
        timestamp: new Date().toISOString(),
      });
    } catch (rabbitmqError) {
      console.error("RabbitMQ error (non-critical):", rabbitmqError);
    }

    res.status(201).json(todo);
  } catch (error) {
    console.error("Error in createTodo:", error);
    res
      .status(500)
      .json({ message: "Error creating todo", error: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { title, description, deadline, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate deadline format if provided
    let formattedDeadline = null;
    if (deadline) {
      try {
        const d = new Date(deadline);
        // Format ke 'YYYY-MM-DD HH:MM:SS' (local time)
        formattedDeadline =
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0") +
          " " +
          String(d.getHours()).padStart(2, "0") +
          ":" +
          String(d.getMinutes()).padStart(2, "0") +
          ":" +
          String(d.getSeconds()).padStart(2, "0");
      } catch (error) {
        return res.status(400).json({ message: "Invalid deadline format" });
      }
    }

    const todo = await Todo.update(
      req.params.id,
      {
        title: title.trim(),
        description: description?.trim() || null,
        deadline: formattedDeadline,
        priority: priority || "medium",
        status: status || "pending",
      },
      req.user.id
    );

    // Publish message to RabbitMQ (non-blocking)
    try {
      await rabbitmq.publishMessage("todo.updated", {
        todoId: todo.id,
        userId: req.user.id,
        action: "updated",
        timestamp: new Date().toISOString(),
      });
    } catch (rabbitmqError) {
      console.error("RabbitMQ error (non-critical):", rabbitmqError);
    }

    res.json(todo);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "Todo not found" });
    }
    console.error("Error in updateTodo:", error);
    res
      .status(500)
      .json({ message: "Error updating todo", error: error.message });
  }
};

exports.updateTodoStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const todo = await Todo.updateStatus(req.params.id, status, req.user.id);

    // Publish message to RabbitMQ (non-blocking)
    try {
      const queueName =
        status === "completed" ? "todo.completed" : "todo.updated";
      await rabbitmq.publishMessage(queueName, {
        todoId: todo.id,
        userId: req.user.id,
        action: "status_updated",
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (rabbitmqError) {
      console.error("RabbitMQ error (non-critical):", rabbitmqError);
    }

    res.json(todo);
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "Todo not found" });
    }
    console.error("Error in updateTodoStatus:", error);
    res
      .status(500)
      .json({ message: "Error updating todo status", error: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.delete(req.params.id, req.user.id);

    // Publish message to RabbitMQ (non-blocking)
    try {
      await rabbitmq.publishMessage("todo.deleted", {
        todoId: req.params.id,
        userId: req.user.id,
        action: "deleted",
        timestamp: new Date().toISOString(),
      });
    } catch (rabbitmqError) {
      console.error("RabbitMQ error (non-critical):", rabbitmqError);
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "Todo not found" });
    }
    console.error("Error in deleteTodo:", error);
    res
      .status(500)
      .json({ message: "Error deleting todo", error: error.message });
  }
};

exports.getTodoStats = async (req, res) => {
  try {
    const stats = await Todo.getStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Error in getTodoStats:", error);
    res
      .status(500)
      .json({ message: "Error fetching todo stats", error: error.message });
  }
};
