import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import { 
  GetApp, 
  ExpandMore,
  TrendingUp,
  Assessment,
  People,
  Category,
  Inventory,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { toast } from 'react-toastify';
import { generateSalesReportPDF } from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    console.log('Fetching comprehensive reports with date range:', {
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD')
    });
    
    try {
      const [salesRes, statsRes] = await Promise.all([
        axios.get('/api/sales/report/', {
          params: {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
          },
        }),
        axios.get('/api/dashboard/stats/'),
      ]);

      console.log('Comprehensive sales report data:', salesRes.data);
      console.log('Stats data:', statsRes.data);
      
      setReportData(salesRes.data);
      setStats(statsRes.data);
      
      toast.success('Comprehensive reports generated successfully');
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDateRangeChange = () => {
    fetchReports();
  };

  const handleDownloadReportPDF = async () => {
    try {
      const dateRange = {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD')
      };
      
      await generateSalesReportPDF(reportData, dateRange);
      toast.success('Comprehensive sales report PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report PDF:', error);
      toast.error('Failed to download report PDF');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Prepare chart data
  const dailyChartData = reportData?.daily_data || [];
  const productPerformanceData = reportData?.product_performance?.slice(0, 10) || [];
  const categoryPerformanceData = reportData?.category_performance || [];
  const employeePerformanceData = reportData?.employee_performance || [];

  const pieData = stats ? [
    { name: 'Employees', value: stats.overview?.total_employees || 0 },
    { name: 'Suppliers', value: stats.overview?.total_suppliers || 0 },
    { name: 'Categories', value: stats.overview?.total_categories || 0 },
    { name: 'Products', value: stats.overview?.total_products || 0 },
  ] : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Comprehensive Sales Reports & Analytics
        </Typography>

        {/* Date Range Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Configuration
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleDateRangeChange}
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={handleDownloadReportPDF}
                disabled={loading || !reportData?.detailed_sales?.length}
                startIcon={<GetApp />}
                sx={{ minWidth: 150 }}
              >
                Download PDF
              </Button>
            </Grid>
          </Grid>
          
          {/* Summary Info */}
          {reportData?.summary && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Date Range</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {startDate.format('MMM DD')} - {endDate.format('MMM DD, YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Sales</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {reportData.summary.total_sales} transactions
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(reportData.summary.total_revenue)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Avg Sale Value</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(reportData.summary.average_sale_value)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Summary Cards */}
        {reportData?.summary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Revenue</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(reportData.summary.total_revenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Before Discount: {formatCurrency(reportData.summary.total_before_discount)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assessment sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Sales</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {reportData.summary.total_sales}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg: {formatCurrency(reportData.summary.average_sale_value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GetApp sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Discount</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(reportData.summary.total_discount)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Avg: {reportData.summary.average_discount_percentage.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Inventory sx={{ mr: 1 }} />
                    <Typography variant="h6">Products Sold</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {reportData.product_performance?.reduce((sum, p) => sum + p.total_quantity_sold, 0) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Unique Products: {reportData.product_performance?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabbed Content */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Charts & Analytics" />
            <Tab label="Detailed Sales" />
            <Tab label="Product Performance" />
            <Tab label="Category Analysis" />
            <Tab label="Employee Performance" />
          </Tabs>

          {/* Tab 0: Charts & Analytics */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Daily Revenue Chart */}
                <Grid item xs={12} lg={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Daily Sales Revenue & Volume
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="created_at__date" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'daily_revenue' ? formatCurrency(value) : value,
                              name === 'daily_revenue' ? 'Revenue' : 'Sales Count'
                            ]}
                          />
                          <Bar yAxisId="left" dataKey="daily_revenue" fill="#1976d2" name="daily_revenue" />
                          <Bar yAxisId="right" dataKey="daily_sales" fill="#00C49F" name="daily_sales" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* System Overview Pie Chart */}
                <Grid item xs={12} lg={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        System Overview
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
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
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Top Products Chart */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top 10 Products by Revenue
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productPerformanceData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="product__name" type="category" width={150} />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="total_revenue" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 1: Detailed Sales */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Sales Transactions
              </Typography>
              {reportData?.detailed_sales?.length > 0 ? (
                <Box>
                  {reportData.detailed_sales.map((sale) => (
                    <Accordion key={sale.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {sale.invoice_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(sale.created_at).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body1">{sale.customer_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sale.customer_contact}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body1">{sale.created_by}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Chip 
                              label={`${sale.items.length} items`} 
                              size="small" 
                              color="primary" 
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(sale.net_amount)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell align="right">Qty</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {sale.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.product_name}</TableCell>
                                  <TableCell>{item.product_code}</TableCell>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell>{item.supplier}</TableCell>
                                  <TableCell align="right">{item.quantity}</TableCell>
                                  <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                                  <TableCell align="right">{formatCurrency(item.total_price)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Subtotal:</strong> {formatCurrency(sale.total_amount)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Discount ({sale.discount_percentage}%):</strong> -{formatCurrency(sale.discount_amount)}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              <strong>Net Total:</strong> {formatCurrency(sale.net_amount)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No sales data found for the selected date range.
                </Typography>
              )}
            </Box>
          )}

          {/* Tab 2: Product Performance */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Performance Analysis
              </Typography>
              {productPerformanceData.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Product Code</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Quantity Sold</TableCell>
                        <TableCell align="right">Total Revenue</TableCell>
                        <TableCell align="right">Sales Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productPerformanceData.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip 
                              label={index + 1} 
                              size="small" 
                              color={index < 3 ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{product.product__name}</TableCell>
                          <TableCell>{product.product__code}</TableCell>
                          <TableCell>{product.product__category__name || 'N/A'}</TableCell>
                          <TableCell align="right">{product.total_quantity_sold}</TableCell>
                          <TableCell align="right">{formatCurrency(product.total_revenue)}</TableCell>
                          <TableCell align="right">{product.sales_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No product performance data available.
                </Typography>
              )}
            </Box>
          )}

          {/* Tab 3: Category Analysis */}
          {activeTab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Category Performance Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {categoryPerformanceData.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Quantity Sold</TableCell>
                            <TableCell align="right">Total Revenue</TableCell>
                            <TableCell align="right">Sales Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryPerformanceData.map((category, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Category sx={{ mr: 1, color: 'primary.main' }} />
                                  {category.product__category__name || 'Uncategorized'}
                                </Box>
                              </TableCell>
                              <TableCell align="right">{category.total_quantity_sold}</TableCell>
                              <TableCell align="right">{formatCurrency(category.total_revenue)}</TableCell>
                              <TableCell align="right">{category.sales_count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      No category performance data available.
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Category Revenue Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryPerformanceData.map(cat => ({
                              name: cat.product__category__name || 'Uncategorized',
                              value: cat.total_revenue
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryPerformanceData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 4: Employee Performance */}
          {activeTab === 4 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Employee Sales Performance
              </Typography>
              {employeePerformanceData.length > 0 ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell align="right">Total Sales</TableCell>
                            <TableCell align="right">Total Revenue</TableCell>
                            <TableCell align="right">Avg Sale Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employeePerformanceData.map((employee, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <People sx={{ mr: 1, color: 'primary.main' }} />
                                  {`${employee.created_by__first_name || ''} ${employee.created_by__last_name || ''}`.trim() || 'Unknown'}
                                </Box>
                              </TableCell>
                              <TableCell>{employee.created_by__username}</TableCell>
                              <TableCell align="right">{employee.total_sales}</TableCell>
                              <TableCell align="right">{formatCurrency(employee.total_revenue)}</TableCell>
                              <TableCell align="right">
                                {formatCurrency(employee.total_revenue / employee.total_sales)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Employee Revenue Contribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={employeePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="created_by__username" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="total_revenue" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No employee performance data available.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;