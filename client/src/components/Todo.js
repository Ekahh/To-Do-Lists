import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: null,
    priority: "medium",
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      showSnackbar("Error fetching todos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!formData.title.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/todos",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, response.data]);
      setFormData({
        title: "",
        description: "",
        deadline: null,
        priority: "medium",
      });
      setOpenDialog(false);
      showSnackbar("Todo created successfully", "success");
    } catch (error) {
      console.error("Error adding todo:", error);
      showSnackbar("Error creating todo", "error");
    }
  };

  const handleUpdateTodo = async () => {
    if (!formData.title.trim()) {
      showSnackbar("Title is required", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/todos/${editingTodo.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(
        todos.map((todo) => (todo.id === editingTodo.id ? response.data : todo))
      );
      setEditingTodo(null);
      setFormData({
        title: "",
        description: "",
        deadline: null,
        priority: "medium",
      });
      setOpenDialog(false);
      showSnackbar("Todo updated successfully", "success");
    } catch (error) {
      console.error("Error updating todo:", error);
      showSnackbar("Error updating todo", "error");
    }
  };

  const handleStatusChange = async (todoId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/todos/${todoId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(
        todos.map((todo) => (todo.id === todoId ? response.data : todo))
      );
      showSnackbar(`Todo marked as ${newStatus}`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showSnackbar("Error updating status", "error");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter((todo) => todo.id !== id));
      showSnackbar("Todo deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting todo:", error);
      showSnackbar("Error deleting todo", "error");
    }
  };

  const openEditDialog = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      deadline: todo.deadline ? new Date(todo.deadline) : null,
      priority: todo.priority || "medium",
    });
    setOpenDialog(true);
  };

  const openAddDialog = () => {
    setEditingTodo(null);
    setFormData({
      title: "",
      description: "",
      deadline: null,
      priority: "medium",
    });
    setOpenDialog(true);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "pending":
        return "default";
      default:
        return "default";
    }
  };

  const filteredTodos = () => {
    switch (currentTab) {
      case 0:
        return todos.filter((todo) => todo.status === "pending");
      case 1:
        return todos.filter((todo) => todo.status === "in_progress");
      case 2:
        return todos.filter((todo) => todo.status === "completed");
      default:
        return todos;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: "auto", mt: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Todo List</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Add Todo
          </Button>
        </Box>

        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab
            label={`Pending (${
              todos.filter((t) => t.status === "pending").length
            })`}
          />
          <Tab
            label={`In Progress (${
              todos.filter((t) => t.status === "in_progress").length
            })`}
          />
          <Tab
            label={`Completed (${
              todos.filter((t) => t.status === "completed").length
            })`}
          />
        </Tabs>

        <List>
          {filteredTodos().map((todo) => (
            <Card key={todo.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {todo.title}
                    </Typography>
                    {todo.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {todo.description}
                      </Typography>
                    )}
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={todo.priority}
                        color={getPriorityColor(todo.priority)}
                        size="small"
                      />
                      <Chip
                        label={todo.status.replace("_", " ")}
                        color={getStatusColor(todo.status)}
                        size="small"
                      />
                      {todo.deadline && (
                        <Chip
                          icon={<ScheduleIcon />}
                          label={new Date(todo.deadline).toLocaleString()}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    {todo.status !== "completed" && (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => openEditDialog(todo)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() =>
                            handleStatusChange(todo.id, "completed")
                          }
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingTodo ? "Edit Todo" : "Add New Todo"}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <DateTimePicker
                label="Deadline"
                value={formData.deadline}
                onChange={(newValue) =>
                  setFormData({ ...formData, deadline: newValue })
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={editingTodo ? handleUpdateTodo : handleAddTodo}
              variant="contained"
            >
              {editingTodo ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default Todo;
