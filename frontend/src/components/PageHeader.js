import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Chip } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  showBreadcrumbs = true,
  status,
  statusColor = 'primary'
}) => {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    return (
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 1 }}
      >
        <Link
          component={RouterLink}
          to="/dashboard"
          color="inherit"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return isLast ? (
            <Typography color="text.primary" key={to} sx={{ textTransform: 'capitalize' }}>
              {value}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              to={to}
              color="inherit"
              key={to}
              sx={{
                textDecoration: 'none',
                textTransform: 'capitalize',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {value}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box className="fade-in" sx={{ mb: 4 }}>
      {showBreadcrumbs && getBreadcrumbs()}
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </Typography>
            {status && (
              <Chip
                label={status}
                color={statusColor}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {action && (
          <Box sx={{ flexShrink: 0 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;