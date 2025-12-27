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
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        axios.get('/api/products/'),
        axios.get('/api/categories/'),
        axios.get('/api/suppliers/'),
      ]);
      
      setProducts(productsRes.data.results || productsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setSuppliers(suppliersRes.data.results || suppliersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    setEditingProduct(product);
    if (product) {
      reset(product);
    } else {
      reset({
        status: 'active',
        quantity: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}/`, data);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products/', data);
        toast.success('Product created successfully');
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}/`);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const columns = [
    { field: 'code', headerName: 'Product Code', width: 120 },
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'category_name', headerName: 'Category', width: 150 },
    { field: 'supplier_name', headerName: 'Supplier', width: 150 },
    { 
      field: 'buy_price', 
      headerName: 'Buy Price', 
      width: 100,
      renderCell: (params) => `₹${params.value}`
    },
    { 
      field: 'sell_price', 
      headerName: 'Sell Price', 
      width: 100,
      renderCell: (params) => `₹${params.value}`
    },
    { 
      field: 'profit_per_unit', 
      headerName: 'Profit/Unit', 
      width: 100,
      renderCell: (params) => `₹${params.value?.toFixed(2) || '0.00'}`
    },
    { 
      field: 'profit_margin_percentage', 
      headerName: 'Margin %', 
      width: 100,
      renderCell: (params) => `${params.value?.toFixed(1) || '0.0'}%`
    },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'is_in_stock',
      headerName: 'In Stock',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Code (Auto-generated if empty)"
                      fullWidth
                      placeholder="Leave empty for auto-generation"
                      error={!!errors.code}
                      helperText={errors.code?.message || "Will be auto-generated if left empty"}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Product name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Category"
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="supplier"
                  control={control}
                  rules={{ required: 'Supplier is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Supplier"
                      fullWidth
                      error={!!errors.supplier}
                      helperText={errors.supplier?.message}
                    >
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="buy_price"
                  control={control}
                  rules={{ 
                    required: 'Buy price is required',
                    min: { value: 0, message: 'Buy price must be positive' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Buy Price (Cost)"
                      type="number"
                      fullWidth
                      error={!!errors.buy_price}
                      helperText={errors.buy_price?.message}
                      InputProps={{
                        startAdornment: '₹'
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="sell_price"
                  control={control}
                  rules={{ 
                    required: 'Sell price is required',
                    min: { value: 0, message: 'Sell price must be positive' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Sell Price"
                      type="number"
                      fullWidth
                      error={!!errors.sell_price}
                      helperText={errors.sell_price?.message}
                      InputProps={{
                        startAdornment: '₹'
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be non-negative' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Status"
                      fullWidth
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Products;