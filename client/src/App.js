import React, { useEffect } from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Todo from "./components/Todo";
import Login from "./components/Login";

const AppContent = () => {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/";
    }
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
          {user && (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1">{user.email}</Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container>{user ? <Todo /> : <Login />}</Container>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
