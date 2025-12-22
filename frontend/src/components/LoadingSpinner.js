import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

const LoadingSpinner = ({ 
  loading, 
  message = 'Loading...', 
  backdrop = false,
  size = 40 
}) => {
  if (backdrop) {
    return (
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" size={size} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {message}
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!loading) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;