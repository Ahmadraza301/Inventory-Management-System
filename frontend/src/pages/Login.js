import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Fade,
  Slide,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  Person,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={800}>
          <Paper
            elevation={24}
            sx={{
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Fade in={true} timeout={1000}>
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: 'primary.main',
                  width: 64,
                  height: 64,
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                }}
              >
                <Business sx={{ fontSize: 32 }} />
              </Avatar>
            </Fade>

            <Fade in={true} timeout={1200}>
              <Typography
                component="h1"
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                IMS Login
              </Typography>
            </Fade>

            <Fade in={true} timeout={1400}>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center', fontWeight: 400 }}
              >
                Inventory Management System
                <br />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Welcome back! Please sign in to continue.
                </Typography>
              </Typography>
            </Fade>

            {error && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '1.2rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 1, width: '100%' }}
            >
              <Fade in={true} timeout={1600}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)',
                      },
                    },
                  }}
                />
              </Fade>

              <Fade in={true} timeout={1800}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.2)',
                      },
                    },
                  }}
                />
              </Fade>

              <Fade in={true} timeout={2000}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                      boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  {loading ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} color="inherit" />
                      Signing In...
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Fade>

              <Fade in={true} timeout={2200}>
                <Box textAlign="center" mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Demo Credentials: Use your superuser account
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Need help? Contact your system administrator
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Login;