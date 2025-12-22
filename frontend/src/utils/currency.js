/**
 * Currency utility functions for Indian Rupee formatting
 */

/**
 * Format a number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  
  const numAmount = parseFloat(amount);
  return `₹${numAmount.toFixed(decimals)}`;
};

/**
 * Format currency with Indian number system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with Indian number system
 */
export const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  
  const numAmount = parseFloat(amount);
  
  if (numAmount >= 10000000) { // 1 crore
    return `₹${(numAmount / 10000000).toFixed(2)} Cr`;
  } else if (numAmount >= 100000) { // 1 lakh
    return `₹${(numAmount / 100000).toFixed(2)} L`;
  } else if (numAmount >= 1000) { // 1 thousand
    return `₹${(numAmount / 1000).toFixed(2)} K`;
  } else {
    return `₹${numAmount.toFixed(2)}`;
  }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and any non-numeric characters except decimal point
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

const currencyUtils = {
  formatCurrency,
  formatIndianCurrency,
  parseCurrency
};

export default currencyUtils;