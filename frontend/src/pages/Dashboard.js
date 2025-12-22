import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Fade,
  Grow,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  People,
  Business,
  Category,
  Inventory,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Warning,
  AttachMoney,
  Timeline,
  Inventory2,
  Assessment,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon, color, trend, trendValue, delay = 0 }) => (
  <Grow in={true} timeout={500 + delay * 100}>
    <Card className="stat-card" sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center">
                {trend === 'up' ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600 
                  }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 56,
              height: 56,
              boxShadow: `0 4px 20px ${color}40`,
            }}
          >
            {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </Grow>
);

const ActivityItem = ({ activity, index }) => (
  <Fade in={true} timeout={300 + index * 100}>
    <Box>
      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
        <ListItemAvatar>
          <Avatar sx={{ 
            bgcolor: activity.type === 'sale' ? 'primary.main' : 'secondary.main',
            width: 40,
            height: 40 
          }}>
            {activity.type === 'sale' ? <ShoppingCart /> : <Inventory />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {activity.title}
            </Typography>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.created_at).toLocaleDateString()}
                </Typography>
                {activity.amount && (
                  <Chip 
                    label={`₹${activity.amount.toFixed(2)}`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>
      {index < 4 && <Divider variant="inset" component="li" />}
    </Box>
  </Fade>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        axios.get('/api/dashboard/stats/'),
        axios.get('/api/dashboard/activities/'),
      ]);

      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Failed to load dashboard data. Please try refreshing the page.
      </Alert>
    );
  }

  const pieData = [
    { name: 'Employees', value: stats.overview.total_employees, color: '#1976d2' },
    { name: 'Suppliers', value: stats.overview.total_suppliers, color: '#388e3c' },
    { name: 'Categories', value: stats.overview.total_categories, color: '#f57c00' },
    { name: 'Products', value: stats.overview.total_products, color: '#7b1fa2' },
  ];

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Dashboard Overview
        </Typography>
        <Chip 
          icon={<Timeline />} 
          label="Real-time Data" 
          color="success" 
          variant="outlined"
        />
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Employees"
            value={stats.overview.total_employees}
            icon={<People />}
            color="#1976d2"
            trend="up"
            trendValue="+5%"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Suppliers"
            value={stats.overview.total_suppliers}
            icon={<Business />}
            color="#388e3c"
            trend="up"
            trendValue="+2%"
            delay={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Categories"
            value={stats.overview.total_categories}
            icon={<Category />}
            color="#f57c00"
            delay={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Products"
            value={stats.overview.total_products}
            icon={<Inventory />}
            color="#7b1fa2"
            trend="up"
            trendValue="+12%"
            delay={3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Sales"
            value={stats.overview.total_sales}
            icon={<ShoppingCart />}
            color="#d32f2f"
            trend="up"
            trendValue="+8%"
            delay={4}
          />
        </Grid>
      </Grid>

      {/* Revenue Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.revenue.total_revenue.toFixed(2)}`}
            icon={<AttachMoney />}
            color="#0288d1"
            trend="up"
            trendValue="+15%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={`₹${stats.revenue.today_revenue.toFixed(2)}`}
            icon={<TrendingUp />}
            color="#2e7d32"
            trend="up"
            trendValue="+22%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={`₹${stats.revenue.week_revenue.toFixed(2)}`}
            icon={<Assessment />}
            color="#7b1fa2"
            trend="up"
            trendValue="+18%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month"
            value={`₹${stats.revenue.month_revenue.toFixed(2)}`}
            icon={<Timeline />}
            color="#f57c00"
            trend="up"
            trendValue="+25%"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Fade in={true} timeout={800}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Sales Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.recent_sales_chart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="created_at__date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="daily_revenue"
                    stroke="#1976d2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* System Overview Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Fade in={true} timeout={1000}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                System Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Fade in={true} timeout={1200}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Recent Activities
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {activities.slice(0, 5).map((activity, index) => (
                  <ActivityItem key={index} activity={activity} index={index} />
                ))}
              </List>
            </Paper>
          </Fade>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={6}>
          <Fade in={true} timeout={1400}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Top Selling Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.top_products}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="product__name" 
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Bar dataKey="total_sold" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Inventory Alerts */}
      {(stats.inventory_alerts.low_stock_count > 0 || stats.inventory_alerts.out_of_stock_count > 0) && (
        <Fade in={true} timeout={1600}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Alert 
                severity="warning" 
                icon={<Warning />}
                sx={{ 
                  borderRadius: 3,
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem'
                  }
                }}
              >
                <AlertTitle sx={{ fontWeight: 600 }}>Inventory Alerts</AlertTitle>
                <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
                  {stats.inventory_alerts.low_stock_count > 0 && (
                    <Chip
                      icon={<Inventory2 />}
                      label={`${stats.inventory_alerts.low_stock_count} products running low`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {stats.inventory_alerts.out_of_stock_count > 0 && (
                    <Chip
                      icon={<Warning />}
                      label={`${stats.inventory_alerts.out_of_stock_count} products out of stock`}
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Alert>
            </Grid>
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default Dashboard;