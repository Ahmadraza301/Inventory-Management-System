import jsPDF from 'jspdf';
import { formatCurrency } from './currency';

/**
 * Generate PDF bill for a sale
 * @param {Object} sale - Sale object with items
 * @param {string} companyName - Company name for the bill
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generateBillPDF = async (sale, companyName = 'Inventory Management System') => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    
    // Company Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyName, pageWidth / 2, 30, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Phone: +91-9999999999 | Email: info@company.com', pageWidth / 2, 40, { align: 'center' });
    
    // Horizontal line
    pdf.line(20, 50, pageWidth - 20, 50);
    
    // Invoice Details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INVOICE', 20, 70);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Left side - Customer details
    pdf.text(`Invoice No: ${sale.invoice_number}`, 20, 85);
    pdf.text(`Date: ${new Date(sale.created_at).toLocaleDateString()}`, 20, 95);
    pdf.text(`Customer: ${sale.customer_name}`, 20, 105);
    pdf.text(`Contact: ${sale.customer_contact}`, 20, 115);
    
    // Right side - Company details
    pdf.text('Bill To:', pageWidth - 100, 85);
    pdf.text(sale.customer_name, pageWidth - 100, 95);
    pdf.text(sale.customer_contact, pageWidth - 100, 105);
    
    // Table Header
    const tableTop = 140;
    pdf.line(20, tableTop - 5, pageWidth - 20, tableTop - 5);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Item', 25, tableTop);
    pdf.text('Qty', 100, tableTop);
    pdf.text('Rate', 130, tableTop);
    pdf.text('Amount', 160, tableTop);
    
    pdf.line(20, tableTop + 5, pageWidth - 20, tableTop + 5);
    
    // Table Content
    pdf.setFont('helvetica', 'normal');
    let yPosition = tableTop + 20;
    
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item, index) => {
        const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity);
        
        pdf.text(item.product_name || `Item ${index + 1}`, 25, yPosition);
        pdf.text(item.quantity.toString(), 100, yPosition);
        pdf.text(formatCurrency(item.unit_price), 130, yPosition);
        pdf.text(formatCurrency(itemTotal), 160, yPosition);
        
        yPosition += 15;
        
        // Add new page if needed
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 30;
        }
      });
    }
    
    // Totals section
    const totalsY = yPosition + 20;
    pdf.line(20, totalsY - 10, pageWidth - 20, totalsY - 10);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('Subtotal:', 130, totalsY);
    pdf.text(formatCurrency(sale.total_amount), 160, totalsY);
    
    pdf.text('Discount:', 130, totalsY + 15);
    pdf.text(`-${formatCurrency(sale.discount_amount || 0)}`, 160, totalsY + 15);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total:', 130, totalsY + 30);
    pdf.text(formatCurrency(sale.net_amount), 160, totalsY + 30);
    
    // Footer
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 30, { align: 'center' });
    pdf.text('Built by Ahmad Built with React & Django', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // Save the PDF
    const fileName = `Invoice_${sale.invoice_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return Promise.resolve(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
};

/**
 * Generate comprehensive PDF report for sales data
 * @param {Object} reportData - Complete report data object
 * @param {Object} dateRange - Start and end date
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generateSalesReportPDF = async (reportData, dateRange) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 30;
    
    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 30;
        return true;
      }
      return false;
    };
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Comprehensive Sales Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Summary Section
    if (reportData.summary) {
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const summary = reportData.summary;
      pdf.text(`Total Sales: ${summary.total_sales} transactions`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Total Revenue: ${formatCurrency(summary.total_revenue)}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Total Before Discount: ${formatCurrency(summary.total_before_discount)}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Total Discount: ${formatCurrency(summary.total_discount)} (${summary.average_discount_percentage.toFixed(1)}%)`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Average Sale Value: ${formatCurrency(summary.average_sale_value)}`, 25, yPosition);
      yPosition += 15;
    }
    
    // Daily Sales Data
    if (reportData.daily_data && reportData.daily_data.length > 0) {
      checkNewPage(60);
      
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Daily Sales Breakdown', 20, yPosition);
      yPosition += 10;
      
      // Table Header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date', 25, yPosition);
      pdf.text('Sales', 70, yPosition);
      pdf.text('Revenue', 110, yPosition);
      pdf.text('Discount', 150, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Table Content
      pdf.setFont('helvetica', 'normal');
      reportData.daily_data.forEach((day) => {
        checkNewPage();
        pdf.text(day.created_at__date, 25, yPosition);
        pdf.text(day.daily_sales.toString(), 70, yPosition);
        pdf.text(formatCurrency(day.daily_revenue), 110, yPosition);
        pdf.text(formatCurrency(day.daily_discount || 0), 150, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // Product Performance
    if (reportData.product_performance && reportData.product_performance.length > 0) {
      checkNewPage(60);
      
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top 10 Products by Revenue', 20, yPosition);
      yPosition += 10;
      
      // Table Header
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rank', 25, yPosition);
      pdf.text('Product', 40, yPosition);
      pdf.text('Code', 100, yPosition);
      pdf.text('Qty', 130, yPosition);
      pdf.text('Revenue', 155, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Table Content
      pdf.setFont('helvetica', 'normal');
      reportData.product_performance.slice(0, 10).forEach((product, index) => {
        checkNewPage();
        pdf.text((index + 1).toString(), 25, yPosition);
        pdf.text(product.product__name.substring(0, 25), 40, yPosition);
        pdf.text(product.product__code || 'N/A', 100, yPosition);
        pdf.text(product.total_quantity_sold.toString(), 130, yPosition);
        pdf.text(formatCurrency(product.total_revenue), 155, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // Category Performance
    if (reportData.category_performance && reportData.category_performance.length > 0) {
      checkNewPage(60);
      
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Category Performance', 20, yPosition);
      yPosition += 10;
      
      // Table Header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Category', 25, yPosition);
      pdf.text('Qty Sold', 100, yPosition);
      pdf.text('Revenue', 140, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Table Content
      pdf.setFont('helvetica', 'normal');
      reportData.category_performance.forEach((category) => {
        checkNewPage();
        pdf.text(category.product__category__name || 'Uncategorized', 25, yPosition);
        pdf.text(category.total_quantity_sold.toString(), 100, yPosition);
        pdf.text(formatCurrency(category.total_revenue), 140, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // Employee Performance
    if (reportData.employee_performance && reportData.employee_performance.length > 0) {
      checkNewPage(60);
      
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Employee Performance', 20, yPosition);
      yPosition += 10;
      
      // Table Header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Employee', 25, yPosition);
      pdf.text('Sales Count', 100, yPosition);
      pdf.text('Total Revenue', 140, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;
      
      // Table Content
      pdf.setFont('helvetica', 'normal');
      reportData.employee_performance.forEach((employee) => {
        checkNewPage();
        const name = `${employee.created_by__first_name || ''} ${employee.created_by__last_name || ''}`.trim() || employee.created_by__username;
        pdf.text(name, 25, yPosition);
        pdf.text(employee.total_sales.toString(), 100, yPosition);
        pdf.text(formatCurrency(employee.total_revenue), 140, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }
    
    // Detailed Sales Transactions
    if (reportData.detailed_sales && reportData.detailed_sales.length > 0) {
      checkNewPage(60);
      
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Sales Transactions', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      reportData.detailed_sales.forEach((sale, index) => {
        checkNewPage(40);
        
        // Sale Header
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. Invoice: ${sale.invoice_number}`, 25, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Customer: ${sale.customer_name} | Contact: ${sale.customer_contact}`, 30, yPosition);
        yPosition += 6;
        pdf.text(`Date: ${new Date(sale.created_at).toLocaleString()} | By: ${sale.created_by}`, 30, yPosition);
        yPosition += 6;
        
        // Items
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach((item) => {
            checkNewPage();
            pdf.text(`  - ${item.product_name} (${item.product_code}) x ${item.quantity} @ ${formatCurrency(item.unit_price)} = ${formatCurrency(item.total_price)}`, 35, yPosition);
            yPosition += 5;
          });
        }
        
        // Totals
        pdf.text(`  Subtotal: ${formatCurrency(sale.total_amount)} | Discount: -${formatCurrency(sale.discount_amount)} | Net: ${formatCurrency(sale.net_amount)}`, 30, yPosition);
        yPosition += 10;
      });
    }
    
    // Footer on last page
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('End of Report', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text('Built by Ahmad Built with React & Django', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    const fileName = `Comprehensive_Sales_Report_${dateRange.start}_to_${dateRange.end}.pdf`;
    pdf.save(fileName);
    
    return Promise.resolve(fileName);
  } catch (error) {
    console.error('Error generating comprehensive sales report PDF:', error);
    return Promise.reject(error);
  }
};

const pdfUtils = {
  generateBillPDF,
  generateSalesReportPDF,
};

export default pdfUtils;