'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Drawing {
  _id: string;
  drawingNumber: string;
  title: string;
  product: any;
  order: any;
  version: string;
  status: string;
  fileType: string;
}

export default function DrawingPage() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [filter, setFilter] = useState({ status: '', productId: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrawings();
    fetchProducts();
  }, [filter]);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.productId) params.append('productId', filter.productId);
      
      const res = await axios.get(`${API_URL}/drawing?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrawings(res.data);
    } catch (error) {
      console.error('Error fetching drawings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (drawingId: string) => {
    if (!confirm('Are you sure you want to delete this drawing? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/drawing/${drawingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDrawings();
      alert('Drawing deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting drawing');
    }
  };

  const generatePDF = async (drawingData: Drawing | Drawing[], filename: string) => {
    // Dynamic import for Next.js compatibility
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const isMultiple = Array.isArray(drawingData);
    
    if (isMultiple) {
      // For multiple drawings, create a summary report
      const doc = new jsPDF();
      const drawings = drawingData;
      
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
      doc.text('All Drawings Report', 105, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 47);
      
      const tableData = drawings.map((drawing) => [
        drawing.drawingNumber || 'N/A',
        drawing.title || 'N/A',
        drawing.product?.name || 'N/A',
        drawing.order?.orderNumber || '-',
        drawing.version || 'N/A',
        drawing.fileType || 'N/A',
        drawing.status || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Drawing #', 'Title', 'Product', 'Order', 'Version', 'File Type', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: false,
          textColor: [0, 0, 0],
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
      // For single drawing, fetch full details and create professional form
      const drawing = drawingData;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/drawing/${drawing._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullDrawing = res.data;
        
        await generateDrawingFormPDF(fullDrawing, filename, jsPDF, autoTable);
      } catch (error) {
        console.error('Error fetching drawing details:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const generateDrawingFormPDF = async (drawing: any, filename: string, jsPDF: any, autoTable: any) => {
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
    doc.text('DRAWING FORM', pageWidth / 2, 40, { align: 'center' });
    
    yPos = 47;
    
    // Drawing Details Section - Grid Form Format
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Drawing Details', margin, yPos);
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
      { label: 'Drawing Number:', value: drawing.drawingNumber || 'N/A', row: currentRow++, col: 0 },
      { label: 'Version:', value: drawing.version || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Title:', value: drawing.title || 'N/A', row: currentRow++, col: 0 },
      { label: 'File Type:', value: drawing.fileType || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Product:', value: drawing.product?.name || 'N/A', row: currentRow++, col: 0 },
      { label: 'Status:', value: drawing.status || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Order:', value: drawing.order?.orderNumber || '-', row: currentRow++, col: 0 },
      { label: 'Revision:', value: drawing.revision || '-', row: currentRow - 1, col: 1 }
    ];
    
    if (drawing.description) {
      fields.push({ label: 'Description:', value: drawing.description, row: currentRow++, col: 0, spanFull: true });
    }
    
    if (drawing.uploadedBy) {
      fields.push({ label: 'Uploaded By:', value: drawing.uploadedBy, row: currentRow++, col: 0 });
    }
    if (drawing.approvedBy) {
      fields.push({ label: 'Approved By:', value: drawing.approvedBy, row: currentRow - 1, col: 1 });
    }
    if (drawing.approvalDate) {
      fields.push({ label: 'Approval Date:', value: new Date(drawing.approvalDate).toLocaleDateString(), row: currentRow++, col: 0 });
    }
    
    // Calculate address height if description exists
    let descriptionExtraHeight = 0;
    const descriptionField = fields.find(f => f.spanFull);
    let descriptionRowIndex = -1;
    if (descriptionField) {
      doc.setFontSize(9);
      const labelWidth = doc.getTextWidth(descriptionField.label);
      const maxWidth = pageWidth - margin - margin - labelWidth - 4;
      const descriptionLines = doc.splitTextToSize(descriptionField.value, maxWidth);
      if (descriptionLines.length > 1) {
        descriptionExtraHeight = (descriptionLines.length - 1) * 5;
      }
      descriptionRowIndex = descriptionField.row;
    }
    
    // Calculate number of rows needed
    const maxRow = Math.max(...fields.map(f => f.row)) + 1;
    const totalGridHeight = (maxRow * cellHeight) + descriptionExtraHeight;
    
    // Draw grid with adjusted height
    for (let row = 0; row <= maxRow; row++) {
      let y = gridStartY + (row * cellHeight);
      if (descriptionRowIndex >= 0 && row > descriptionRowIndex) {
        y += descriptionExtraHeight;
      }
      doc.line(margin, y, pageWidth - margin, y);
    }
    
    // Vertical lines
    doc.line(margin, gridStartY, margin, gridStartY + totalGridHeight);
    doc.line(rightColStart, gridStartY, rightColStart, gridStartY + totalGridHeight);
    doc.line(pageWidth - margin, gridStartY, pageWidth - margin, gridStartY + totalGridHeight);
    
    // Fill in the fields
    doc.setFontSize(9);
    fields.forEach(field => {
      let y = gridStartY + (field.row * cellHeight) + 5;
      
      if (field.spanFull) {
        const x = margin + 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(field.label, x, y);
        
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(field.label);
        const valueX = x + labelWidth + 2;
        const maxWidth = pageWidth - margin - valueX - 2;
        const valueLines = doc.splitTextToSize(field.value, maxWidth);
        
        valueLines.forEach((line: string, index: number) => {
          doc.text(line, valueX, y + (index * 5));
        });
      } else {
        const x = field.col === 0 ? margin + 2 : rightColStart + 2;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(field.label, x, y);
        
        doc.setFont('helvetica', 'normal');
        const labelWidth = doc.getTextWidth(field.label);
        const valueX = x + labelWidth + 2;
        const maxWidth = (field.col === 0 ? leftColWidth : rightColWidth) - labelWidth - 4;
        const valueLines = doc.splitTextToSize(field.value, maxWidth);
        
        valueLines.forEach((line: string, index: number) => {
          doc.text(line, valueX, y + (index * 4));
        });
      }
    });
    
    yPos = gridStartY + totalGridHeight + 10;
    
    // Specifications Section if available
    if (drawing.specifications) {
      yPos += 5;
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Specifications', margin, yPos);
      yPos += 8;
      
      const specData: string[][] = [];
      if (drawing.specifications.material) {
        specData.push(['Material', drawing.specifications.material]);
      }
      if (drawing.specifications.weight) {
        specData.push(['Weight', `${drawing.specifications.weight} kg`]);
      }
      if (drawing.specifications.dimensions) {
        const dims = drawing.specifications.dimensions;
        if (dims.length !== undefined && dims.length !== null) specData.push(['Length', `${dims.length} mm`]);
        if (dims.width !== undefined && dims.width !== null) specData.push(['Width', `${dims.width} mm`]);
        if (dims.height !== undefined && dims.height !== null) specData.push(['Height', `${dims.height} mm`]);
        if (dims.thickness !== undefined && dims.thickness !== null) specData.push(['Thickness', `${dims.thickness} mm`]);
        if (dims.outerDiameter !== undefined && dims.outerDiameter !== null) specData.push(['Outer Diameter', `${dims.outerDiameter} mm`]);
        if (dims.innerDiameter !== undefined && dims.innerDiameter !== null) specData.push(['Inner Diameter', `${dims.innerDiameter} mm`]);
      }
      if (drawing.specifications.other) {
        specData.push(['Other', drawing.specifications.other]);
      }
      
      if (specData.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Field', 'Value']],
          body: specData,
          theme: 'grid',
          headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 120 }
          },
          margin: { left: margin, right: margin }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
    }
    
    // Notes if available
    if (drawing.notes) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(drawing.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, yPos);
      yPos += notesLines.length * 5 + 5;
    }
    
    // Drawing File Section - Embed image if available
    if (drawing.drawingFile) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Drawing File', margin, yPos);
      yPos += 8;
      
      try {
        // Construct the full URL for the drawing file
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const fileUrl = `${baseUrl}${drawing.drawingFile}`;
        
        // Check if it's an image file
        const imageTypes = ['PNG', 'JPG', 'JPEG', 'GIF'];
        const isImage = imageTypes.includes(drawing.fileType?.toUpperCase() || '');
        
        if (isImage) {
          // Fetch and embed image
          try {
            let blob: Blob;
            const token = localStorage.getItem('token');
            
            // Try with authentication first, fallback to without if it fails
            try {
              const response = await axios.get(fileUrl, {
                responseType: 'blob',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              blob = response.data;
            } catch (authError) {
              // If auth fails, try without authentication (static files)
              const response = await axios.get(fileUrl, {
                responseType: 'blob'
              });
              blob = response.data;
            }
            
            const imageDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            
            // Determine image format from data URL or file type
            let imageFormat = 'PNG';
            if (drawing.fileType?.toUpperCase() === 'JPG' || drawing.fileType?.toUpperCase() === 'JPEG') {
              imageFormat = 'JPEG';
            } else if (imageDataUrl.startsWith('data:image/')) {
              const match = imageDataUrl.match(/data:image\/(\w+);/);
              if (match) {
                imageFormat = match[1].toUpperCase();
              }
            }
            
            // Calculate image dimensions to fit on page
            const maxWidth = pageWidth - 2 * margin;
            const maxHeight = pageHeight - yPos - 30; // Leave space for footer
            
            // Get image dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageDataUrl;
            });
            
            // Calculate scaling to fit
            let imgWidth = img.width;
            let imgHeight = img.height;
            const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
            imgWidth = imgWidth * scale;
            imgHeight = imgHeight * scale;
            
            // Check if image needs a new page
            if (yPos + imgHeight > pageHeight - 30) {
              doc.addPage();
              yPos = margin;
            }
            
            // Center the image
            const xPos = (pageWidth - imgWidth) / 2;
            
            // Add image to PDF
            doc.addImage(imageDataUrl, imageFormat, xPos, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;
          } catch (fetchError) {
            console.error('Error fetching image:', fetchError);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Drawing file could not be loaded.', margin, yPos);
            yPos += 10;
          }
        } else {
          // For non-image files (PDF, DWG, DXF), add a reference
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`File Type: ${drawing.fileType || 'N/A'}`, margin, yPos);
          yPos += 5;
          doc.text(`File: ${drawing.drawingFile}`, margin, yPos);
          yPos += 5;
          doc.text('Note: The drawing file is available separately and can be downloaded from the system.', margin, yPos);
          yPos += 10;
        }
      } catch (error) {
        console.error('Error loading drawing file:', error);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Drawing file could not be embedded.', margin, yPos);
        yPos += 10;
      }
    }
    
    // Supporting Document - Order Details Section
    if (drawing.order?._id || drawing.order) {
      try {
        const orderId = drawing.order._id || drawing.order;
        const token = localStorage.getItem('token');
        
        // Fetch order details
        const orderRes = await axios.get(`${API_URL}/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const order = orderRes.data;
        
        // Add new page for order details
        if (yPos > pageHeight - 100) {
          doc.addPage();
          yPos = margin;
        } else {
          yPos += 15;
        }
        
        // Divider line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        // Supporting Document Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('SUPPORTING DOCUMENT - ORDER DETAILS', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        
        // Order Details Section - Grid Form Format
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Details', margin, yPos);
        yPos += 8;
        
        // Create grid form layout with borders
        const orderGridStartY = yPos;
        const orderCellHeight = 8;
        const orderLeftColWidth = 90;
        const orderRightColWidth = pageWidth - 2 * margin - orderLeftColWidth;
        const orderRightColStart = margin + orderLeftColWidth;
        
        // Draw grid borders
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        
        // Prepare order fields in grid format
        let orderCurrentRow = 0;
        const orderFields: Array<{ label: string; value: any; row: number; col: number; spanFull?: boolean }> = [
          { label: 'Order Number:', value: order.orderNumber || 'N/A', row: orderCurrentRow++, col: 0 },
          { label: 'Order Date:', value: new Date(order.orderDate).toLocaleDateString(), row: orderCurrentRow - 1, col: 1 },
          { label: 'Customer Name:', value: order.customerName || 'N/A', row: orderCurrentRow++, col: 0 },
          { label: 'Delivery Date:', value: order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A', row: orderCurrentRow - 1, col: 1 },
          { label: 'Status:', value: order.status || 'N/A', row: orderCurrentRow++, col: 0 },
          { label: 'Priority:', value: order.priority || 'N/A', row: orderCurrentRow - 1, col: 1 }
        ];
        
        // Add optional fields
        if (order.customerContact) {
          orderFields.push({ label: 'Contact:', value: order.customerContact, row: orderCurrentRow++, col: 0 });
        }
        if (order.customerGSTIN) {
          if (order.customerContact) {
            orderFields.push({ label: 'GSTIN:', value: order.customerGSTIN, row: orderCurrentRow - 1, col: 1 });
          } else {
            orderFields.push({ label: 'GSTIN:', value: order.customerGSTIN, row: orderCurrentRow++, col: 0 });
          }
        }
        
        // Add Address field - spans full width if available
        if (order.customerAddress) {
          orderFields.push({ label: 'Address:', value: order.customerAddress, row: orderCurrentRow++, col: 0, spanFull: true });
        }
        
        // Calculate address height
        let orderAddressExtraHeight = 0;
        const orderAddressField = orderFields.find(f => f.spanFull);
        let orderAddressRowIndex = -1;
        if (orderAddressField) {
          doc.setFontSize(9);
          const labelWidth = doc.getTextWidth(orderAddressField.label);
          const maxWidth = pageWidth - margin - margin - labelWidth - 4;
          const addressLines = doc.splitTextToSize(orderAddressField.value, maxWidth);
          if (addressLines.length > 1) {
            orderAddressExtraHeight = (addressLines.length - 1) * 5;
          }
          orderAddressRowIndex = orderAddressField.row;
        }
        
        // Calculate number of rows needed
        const orderMaxRow = Math.max(...orderFields.map(f => f.row)) + 1;
        const orderTotalGridHeight = (orderMaxRow * orderCellHeight) + orderAddressExtraHeight;
        
        // Draw grid with adjusted height
        for (let row = 0; row <= orderMaxRow; row++) {
          let y = orderGridStartY + (row * orderCellHeight);
          if (orderAddressRowIndex >= 0 && row > orderAddressRowIndex) {
            y += orderAddressExtraHeight;
          }
          doc.line(margin, y, pageWidth - margin, y);
        }
        
        // Vertical lines
        doc.line(margin, orderGridStartY, margin, orderGridStartY + orderTotalGridHeight);
        doc.line(orderRightColStart, orderGridStartY, orderRightColStart, orderGridStartY + orderTotalGridHeight);
        doc.line(pageWidth - margin, orderGridStartY, pageWidth - margin, orderGridStartY + orderTotalGridHeight);
        
        // Fill in the fields
        doc.setFontSize(9);
        orderFields.forEach(field => {
          let y = orderGridStartY + (field.row * orderCellHeight) + 5;
          if (orderAddressRowIndex >= 0 && field.row > orderAddressRowIndex) {
            y += orderAddressExtraHeight;
          }
          
          if (field.spanFull) {
            const x = margin + 2;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(field.label, x, y);
            
            doc.setFont('helvetica', 'normal');
            const labelWidth = doc.getTextWidth(field.label);
            const valueX = x + labelWidth + 2;
            const maxWidth = pageWidth - margin - valueX - 2;
            const valueLines = doc.splitTextToSize(field.value, maxWidth);
            
            valueLines.forEach((line: string, index: number) => {
              doc.text(line, valueX, y + (index * 5));
            });
          } else {
            const x = field.col === 0 ? margin + 2 : orderRightColStart + 2;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(field.label, x, y);
            
            doc.setFont('helvetica', 'normal');
            const labelWidth = doc.getTextWidth(field.label);
            const valueX = x + labelWidth + 2;
            const maxWidth = (field.col === 0 ? orderLeftColWidth : orderRightColWidth) - labelWidth - 4;
            const valueLines = doc.splitTextToSize(field.value, maxWidth);
            
            valueLines.forEach((line: string, index: number) => {
              doc.text(line, valueX, y + (index * 4));
            });
          }
        });
        
        yPos = orderGridStartY + orderTotalGridHeight + 10;
        
        // Order Items Section
        if (order.items && order.items.length > 0) {
          yPos += 5;
          if (yPos > pageHeight - 100) {
            doc.addPage();
            yPos = margin;
          }
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Order Items', margin, yPos);
          yPos += 8;
          
          // Prepare items table
          const itemsData = order.items.map((item: any, index: number) => [
            (index + 1).toString(),
            item.product?.name || 'N/A',
            item.product?.code || item.product?.serialNo || '-',
            `${item.quantity || 0} ${item.unit || 'PCS'}`,
            `Rs. ${(item.rate || 0).toFixed(2)}`,
            `Rs. ${(item.amount || 0).toFixed(2)}`,
            item.specifications || '-'
          ]);
          
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
          yPos += 10;
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        // Continue without order details if fetch fails
      }
    }
    
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

  const handleDownloadIndividual = async (drawing: Drawing) => {
    await generatePDF(drawing, `SOLIDEX_Drawing_${drawing.drawingNumber || drawing._id}.pdf`);
  };

  const handleDownloadAll = async () => {
    if (drawings.length === 0) {
      alert('No drawings to download');
      return;
    }
    await generatePDF(drawings, `SOLIDEX_All_Drawings_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Drawing Management</h2>
              <div className="flex gap-2">
                {drawings.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Download All PDF
                  </button>
                )}
                <Link 
                  href="/admin/drawing/create"
                  className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Upload Drawing
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
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Superseded">Superseded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product</label>
                  <select
                    value={filter.productId}
                    onChange={(e) => setFilter({ ...filter, productId: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  >
                    <option value="">All Products</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Drawing #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">File Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {drawings.map((drawing) => (
                      <tr key={drawing._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{drawing.drawingNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{drawing.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{drawing.product?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{drawing.order?.orderNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{drawing.version}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{drawing.fileType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            drawing.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            drawing.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            drawing.status === 'Pending Approval' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {drawing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link href={`/admin/drawing/${drawing._id}`} className="text-brand-blue dark:text-blue-400 hover:underline">View</Link>
                          <Link href={`/admin/drawing/${drawing._id}/edit`} className="text-brand-yellow dark:text-yellow-400 hover:underline">Edit</Link>
                          <button
                            onClick={() => handleDownloadIndividual(drawing)}
                            className="text-brand-green dark:text-green-400 hover:underline"
                            title="Download PDF"
                          >
                            📥 PDF
                          </button>
                          <button
                            onClick={() => handleDelete(drawing._id)}
                            className="text-red-600 dark:text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {drawings.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">No drawings found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

