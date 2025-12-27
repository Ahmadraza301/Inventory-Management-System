import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Suppliers from './pages/Suppliers';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';

// Import axios configuration
import './config/axios';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        {/* Redirect old routes to new structure */}
        <Route path="/employees" element={<Navigate to="/dashboard/employees" replace />} />
        <Route path="/suppliers" element={<Navigate to="/dashboard/suppliers" replace />} />
        <Route path="/categories" element={<Navigate to="/dashboard/categories" replace />} />
        <Route path="/products" element={<Navigate to="/dashboard/products" replace />} />
        <Route path="/sales" element={<Navigate to="/dashboard/sales" replace />} />
        <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;