import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Delete, ShoppingCart, GetApp } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { generateBillPDF } from '../utils/pdfGenerator';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      customer_name: '',
      customer_contact: '',
      discount_percentage: 5,
      items: [{ product: null, quantity: 1, unit_price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get('/api/sales/'),
        axios.get('/api/products/'),
      ]);
      
      setSales(salesRes.data.results || salesRes.data);
      setProducts(productsRes.data.results || productsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    reset({
      customer_name: '',
      customer_contact: '',
      discount_percentage: 5,
      items: [{ product: null, quantity: 1, unit_price: 0 }]
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      console.log('Submitting sale data:', data);
      
      // Validate that we have at least one item with a product
      if (!data.items || data.items.length === 0) {
        toast.error('Please add at least one item to the sale');
        return;
      }
      
      // Check if all items have products selected
      const invalidItems = data.items.filter(item => !item.product || !item.product.id);
      if (invalidItems.length > 0) {
        toast.error('Please select a product for all items');
        return;
      }
      
      // Transform data for API
      const saleData = {
        customer_name: data.customer_name,
        customer_contact: data.customer_contact,
        discount_percentage: parseFloat(data.discount_percentage || 5),
        items: data.items.map(item => ({
          product: item.product.id,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0
        }))
      };

      console.log('Transformed sale data:', saleData);

      const response = await axios.post('/api/sales/', saleData);
      console.log('Sale creation response:', response.data);
      
      toast.success('Sale created successfully');
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Sale creation error:', error);
      
      // Show specific error messages
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('Error response data:', errorData);
        
        // Handle field-specific errors
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              toast.error(`${field}: ${errorData[field][0]}`);
            } else if (typeof errorData[field] === 'string') {
              toast.error(`${field}: ${errorData[field]}`);
            }
          });
        } else {
          toast.error(`Error: ${errorData}`);
        }
      } else {
        toast.error('Failed to create sale. Please check all required fields.');
      }
    }
  };

  const handleProductChange = (index, product) => {
    if (product) {
      setValue(`items.${index}.unit_price`, product.price);
    }
  };

  const calculateTotal = () => {
    return watchedItems.reduce((total, item) => {
      return total + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0));
    }, 0);
  };

  const handleDownloadPDF = async (sale) => {
    try {
      // Fetch full sale details with items
      const response = await axios.get(`/api/sales/${sale.id}/`);
      const fullSaleData = response.data;
      
      // Generate and download PDF
      await generateBillPDF(fullSaleData);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const columns = [
    { field: 'invoice_number', headerName: 'Invoice #', width: 150 },
    { field: 'customer_name', headerName: 'Customer', width: 150 },
    { field: 'customer_contact', headerName: 'Contact', width: 130 },
    { 
      field: 'total_amount', 
      headerName: 'Total', 
      width: 100,
      renderCell: (params) => `₹${params.value}`
    },
    { 
      field: 'net_amount', 
      headerName: 'Net Amount', 
      width: 120,
      renderCell: (params) => `₹${params.value}`
    },
    { field: 'items_count', headerName: 'Items', width: 80 },
    { 
      field: 'created_at', 
      headerName: 'Date', 
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleDownloadPDF(params.row)}
          color="primary"
          title="Download PDF"
        >
          <GetApp />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Sales</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          New Sale
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={sales}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ShoppingCart sx={{ mr: 1 }} />
            New Sale
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="customer_name"
                  control={control}
                  rules={{ required: 'Customer name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer Name"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="customer_contact"
                  control={control}
                  rules={{ required: 'Customer contact is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer Contact"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>

              {/* Items */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Items
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Unit Price</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Controller
                              name={`items.${index}.product`}
                              control={control}
                              rules={{ required: 'Product is required' }}
                              render={({ field }) => (
                                <Autocomplete
                                  {...field}
                                  options={products}
                                  getOptionLabel={(option) => option.name || ''}
                                  onChange={(_, value) => {
                                    field.onChange(value);
                                    handleProductChange(index, value);
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Select Product"
                                      size="small"
                                    />
                                  )}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              rules={{ required: true, min: 1 }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  inputProps={{ min: 1 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.unit_price`}
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  inputProps={{ min: 0, step: 0.01 }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            ₹{(parseFloat(watchedItems[index]?.unit_price || 0) * 
                               parseInt(watchedItems[index]?.quantity || 0)).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  startIcon={<Add />}
                  onClick={() => append({ product: null, quantity: 1, unit_price: 0 })}
                  sx={{ mt: 1 }}
                >
                  Add Item
                </Button>
              </Grid>

              {/* Summary */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="discount_percentage"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Discount %"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, max: 100 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1">
                          Subtotal: ₹{calculateTotal().toFixed(2)}
                        </Typography>
                        <Typography variant="body1">
                          Discount: ₹{(calculateTotal() * (watch('discount_percentage') || 0) / 100).toFixed(2)}
                        </Typography>
                        <Typography variant="h6">
                          Total: ₹{(calculateTotal() - (calculateTotal() * (watch('discount_percentage') || 0) / 100)).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Sale
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Sales;