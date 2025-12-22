import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Inventory,
  TrendingUp,
  People,
  Assessment,
  Security,
  Speed,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Inventory sx={{ fontSize: 40 }} />,
      title: 'Inventory Management',
      description: 'Track products, categories, and suppliers with real-time stock updates.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Sales Analytics',
      description: 'Generate detailed reports and analytics to boost your business growth.',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Employee Management',
      description: 'Manage your team with comprehensive employee profiles and permissions.',
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Advanced Reports',
      description: 'Get insights with interactive charts and downloadable PDF reports.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast & Efficient',
      description: 'Modern web technology for lightning-fast performance.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: 'transparent',
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Inventory sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Inventory Management System
            </Typography>
          </Box>
          <Button 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Modern Inventory Management
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Streamline your business operations with our comprehensive inventory management solution. 
            Track products, manage sales, and generate insights with ease.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Login to Dashboard
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Powerful Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      color: 'primary.main', 
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 6,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Transform Your Business?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of businesses already using our inventory management system.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.2rem',
              borderRadius: 2,
            }}
          >
            Start Your Free Trial
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          bgcolor: alpha(theme.palette.grey[900], 0.05),
          py: 4,
          mt: 8,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © 2025 Inventory Management System. Built by Ahmad Built with React & Django.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;