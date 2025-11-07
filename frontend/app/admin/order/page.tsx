'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  status: string;
  priority: string;
  totalAmount: number;
  items: any[];
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState({ status: '', customerName: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.customerName) params.append('customerName', filter.customerName);
      
      const res = await axios.get(`${API_URL}/order?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      alert('Order deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting order');
    }
  };

  const generatePDF = async (orderData: Order | Order[], filename: string) => {
    // Dynamic import for Next.js compatibility
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const isMultiple = Array.isArray(orderData);
    
    if (isMultiple) {
      // For multiple orders, create a summary report
      const doc = new jsPDF();
      const orders = orderData;
      
      // SOLIDEX Letterhead - Left corner with split colors
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      
      // SOLI in black (including the I)
      doc.setTextColor(0, 0, 0);
      doc.text('SOLI', 14, 18);
      
      // DEX in red
      doc.setTextColor(255, 0, 0);
      const soliWidth = doc.getTextWidth('SOLI');
      doc.text('DEX', 14 + soliWidth, 18);
      
      // Tagline below
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Manufacturing Excellence', 14, 26);
      
      // Horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('All Orders Report', 105, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 47);
      
      const tableData = orders.map((order) => [
        order.orderNumber,
        order.customerName,
        new Date(order.orderDate).toLocaleDateString(),
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-',
        `₹${order.totalAmount.toLocaleString()}`,
        order.status,
        order.priority
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Order #', 'Customer', 'Order Date', 'Delivery Date', 'Amount', 'Status', 'Priority']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { fontSize: 8, cellPadding: 3 }
      });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 277, 196, 277);
        
        // Company info - Address and Phone
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', 105, 282, { align: 'center' });
        doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', 105, 286, { align: 'center' });
        doc.text('Phone: 098457 24747', 105, 290, { align: 'center' });
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 294, { align: 'center' });
      }
      
      doc.save(filename);
    } else {
      // For single order, fetch full details and create professional form
      const order = orderData;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/order/${order._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullOrder = res.data;
        
        await generateOrderFormPDF(fullOrder, filename, jsPDF, autoTable);
      } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const generateOrderFormPDF = async (order: any, filename: string, jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    let yPos = margin;
    
    // SOLIDEX Letterhead - Left corner with split colors
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    
    // SOLI in black (including the I)
    doc.setTextColor(0, 0, 0);
    doc.text('SOLI', margin, 18);
    
    // DEX in red
    doc.setTextColor(255, 0, 0);
    const soliWidth = doc.getTextWidth('SOLI');
    doc.text('DEX', margin + soliWidth, 18);
    
    // Tagline below
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Manufacturing Excellence', margin, 26);
    
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageWidth - margin, 30);
    
    // Form Title - centered
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER FORM', pageWidth / 2, 40, { align: 'center' });
    
    yPos = 47;
    
    // Order Details Section - Grid Form Format
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', margin, yPos);
    yPos += 8;
    
    // Create grid form layout with borders
    const gridStartY = yPos;
    const cellHeight = 8;
    const leftColWidth = 90;
    const rightColWidth = pageWidth - 2 * margin - leftColWidth;
    const rightColStart = margin + leftColWidth;
    
    // Draw grid borders
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    
    // Prepare fields in grid format (2 columns, multiple rows)
    let currentRow = 0;
    const fields: Array<{ label: string; value: any; row: number; col: number; spanFull?: boolean }> = [
      { label: 'Order Number:', value: order.orderNumber || 'N/A', row: currentRow++, col: 0 },
      { label: 'Order Date:', value: new Date(order.orderDate).toLocaleDateString(), row: currentRow - 1, col: 1 },
      { label: 'Customer Name:', value: order.customerName || 'N/A', row: currentRow++, col: 0 },
      { label: 'Delivery Date:', value: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Status:', value: order.status || 'N/A', row: currentRow++, col: 0 },
      { label: 'Priority:', value: order.priority || 'N/A', row: currentRow - 1, col: 1 }
    ];
    
    // Add optional fields
    if (order.customerContact) {
      fields.push({ label: 'Contact:', value: order.customerContact, row: currentRow++, col: 0 });
    }
    if (order.customerGSTIN) {
      if (order.customerContact) {
        fields.push({ label: 'GSTIN:', value: order.customerGSTIN, row: currentRow - 1, col: 1 });
      } else {
        fields.push({ label: 'GSTIN:', value: order.customerGSTIN, row: currentRow++, col: 0 });
      }
    }
    
    // Add Address field - spans full width if available
    if (order.customerAddress) {
      fields.push({ label: 'Address:', value: order.customerAddress, row: currentRow++, col: 0, spanFull: true });
    }
    
    // Calculate address height BEFORE drawing grid (using correct font size)
    let addressExtraHeight = 0;
    const addressField = fields.find(f => f.spanFull);
    let addressRowIndex = -1;
    if (addressField) {
      doc.setFontSize(9);
      const labelWidth = doc.getTextWidth(addressField.label);
      const maxWidth = pageWidth - margin - margin - labelWidth - 4;
      const addressLines = doc.splitTextToSize(addressField.value, maxWidth);
      if (addressLines.length > 1) {
        addressExtraHeight = (addressLines.length - 1) * 5; // More spacing for readability
      }
      addressRowIndex = addressField.row;
    }
    
    // Calculate number of rows needed
    const maxRow = Math.max(...fields.map(f => f.row)) + 1;
    const totalGridHeight = (maxRow * cellHeight) + addressExtraHeight;
    
    // Draw grid with adjusted height for address row
    for (let row = 0; row <= maxRow; row++) {
      let y = gridStartY + (row * cellHeight);
      // Adjust y position for rows after the address row
      if (addressRowIndex >= 0 && row > addressRowIndex) {
        y += addressExtraHeight;
      }
      // Horizontal lines
      doc.line(margin, y, pageWidth - margin, y);
    }
    
    // Vertical lines - use total grid height
    doc.line(margin, gridStartY, margin, gridStartY + totalGridHeight);
    doc.line(rightColStart, gridStartY, rightColStart, gridStartY + totalGridHeight);
    doc.line(pageWidth - margin, gridStartY, pageWidth - margin, gridStartY + totalGridHeight);
    
    // Fill in the fields
    doc.setFontSize(9);
    fields.forEach(field => {
      let y = gridStartY + (field.row * cellHeight) + 5;
      
      // Handle full-width fields (like address)
      if (field.spanFull) {
        const x = margin + 2;
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(field.label, x, y);
        
        // Value - split into multiple lines if needed, spanning full width
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(field.label);
        const valueX = x + labelWidth + 2;
        const maxWidth = pageWidth - margin - valueX - 2;
        const valueLines = doc.splitTextToSize(field.value, maxWidth);
        
        // Draw value lines with proper spacing
        valueLines.forEach((line: string, index: number) => {
          doc.text(line, valueX, y + (index * 5));
        });
      } else {
        const x = field.col === 0 ? margin + 2 : rightColStart + 2;
        
        // Label
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(field.label, x, y);
        
        // Value
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(field.label);
        const valueX = x + labelWidth + 2;
        const maxWidth = (field.col === 0 ? leftColWidth : rightColWidth) - labelWidth - 4;
        const valueLines = doc.splitTextToSize(field.value, maxWidth);
        
        // Draw value (handle multi-line if needed)
        valueLines.forEach((line: string, index: number) => {
          doc.text(line, valueX, y + (index * 4));
        });
      }
    });
    
    // Set yPos to the bottom of the grid with proper spacing
    yPos = gridStartY + totalGridHeight + 10;
    
    // Order Items Section
    yPos += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Items', margin, yPos);
    yPos += 8;
    
    // Prepare items table
    const itemsData = order.items?.map((item: any, index: number) => [
      (index + 1).toString(),
      item.product?.name || 'N/A',
      item.product?.code || item.product?.serialNo || '-',
      `${item.quantity || 0} ${item.unit || 'PCS'}`,
      `Rs. ${(item.rate || 0).toFixed(2)}`,
      `Rs. ${(item.amount || 0).toFixed(2)}`,
      item.specifications || '-'
    ]) || [];
    
    autoTable(doc, {
      startY: yPos,
      head: [['SL. No.', 'Product Description', 'Product Code', 'Quantity', 'Rate', 'Amount', 'Specifications']],
      body: itemsData,
      theme: 'grid',
      headStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
        lineColor: [220, 220, 220],
        lineWidth: 0.3
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 40 }
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Total Amount
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', pageWidth - margin - 50, yPos);
    doc.setFontSize(12);
    doc.text(`Rs. ${(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, yPos, { align: 'right' });
    
    yPos += 15;
    
    // Terms and Conditions Section
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions:', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const terms = [
      '1. All items are subject to quality inspection before dispatch.',
      '2. Delivery dates are estimates and may vary based on production schedules.',
      '3. Payment terms: As per agreed terms between parties.',
      '4. Any defects or damages must be reported within 7 days of delivery.',
      '5. SOLIDEX reserves the right to modify specifications with customer approval.'
    ];
    
    terms.forEach((term) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(term, margin + 3, yPos);
      yPos += 5;
    });
    
    yPos += 5;
    
    // Remarks if available
    if (order.remarks) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Remarks:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const remarksLines = doc.splitTextToSize(order.remarks, pageWidth - 2 * margin);
      doc.text(remarksLines, margin, yPos);
      yPos += remarksLines.length * 5 + 5;
    }
    
    // Signature Section
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Customer Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Acknowledgment:', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('I hereby acknowledge and accept the above order details and terms.', margin, yPos);
    yPos += 12;
    
    doc.text('Customer Signature:', margin, yPos);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos + 3, margin + 60, yPos + 3);
    doc.text('Date:', margin + 70, yPos);
    doc.line(margin + 75, yPos + 3, margin + 110, yPos + 3);
    
    yPos += 15;
    
    // Authorized Person Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Issued By (Authorized Person):', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Name:', margin, yPos);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 15, yPos + 3, margin + 80, yPos + 3);
    
    doc.text('Designation:', margin + 90, yPos);
    doc.line(margin + 140, yPos + 3, pageWidth - margin, yPos + 3);
    
    yPos += 8;
    doc.text('Signature:', margin, yPos);
    doc.line(margin + 25, yPos + 3, margin + 80, yPos + 3);
    
    doc.text('Date:', margin + 90, yPos);
    doc.line(margin + 105, yPos + 3, pageWidth - margin, yPos + 3);
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
      
      // Company info - Address and Phone
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', pageWidth / 2, pageHeight - 16, { align: 'center' });
      doc.text('Phone: 098457 24747', pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }
    
    doc.save(filename);
  };

  const handleDownloadIndividual = async (order: Order) => {
    await generatePDF(order, `SOLIDEX_Order_${order.orderNumber}.pdf`);
  };

  const handleDownloadAll = async () => {
    if (orders.length === 0) {
      alert('No orders to download');
      return;
    }
    await generatePDF(orders, `SOLIDEX_All_Orders_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h2>
              <div className="flex gap-2">
                {orders.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Download All PDF
                  </button>
                )}
                <Link 
                  href="/admin/order/create"
                  className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Order
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Production">In Production</option>
                    <option value="Ready for Inspection">Ready for Inspection</option>
                    <option value="Inspection Scheduled">Inspection Scheduled</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={filter.customerName}
                    onChange={(e) => setFilter({ ...filter, customerName: e.target.value })}
                    placeholder="Search customer..."
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-900 dark:text-white">Loading...</div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{order.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            order.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            order.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            order.status === 'In Production' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            order.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            order.priority === 'Urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            order.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                            order.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link href={`/admin/order/${order._id}`} className="text-brand-blue dark:text-blue-400 hover:underline">View</Link>
                          <Link href={`/admin/order/${order._id}/edit`} className="text-brand-yellow dark:text-yellow-400 hover:underline">Edit</Link>
                          <button
                            onClick={() => handleDownloadIndividual(order)}
                            className="text-brand-green dark:text-green-400 hover:underline"
                            title="Download PDF"
                          >
                            📥 PDF
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="text-red-600 dark:text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">No orders found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

