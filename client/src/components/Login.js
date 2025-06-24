import React from "react";
import { Button, Paper, Typography, Box } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Selamat Datang di Aplikasi TODO
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Silakan masuk dengan akun Google Anda untuk melanjutkan
        </Typography>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={login}
          size="large"
          sx={{ mt: 2 }}
        >
          Masuk dengan Google
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;
