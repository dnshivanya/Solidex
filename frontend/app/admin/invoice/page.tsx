'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: string;
  date: string;
  partyName: string;
  total: number;
  status: string;
  items: any[];
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      
      const res = await axios.get(`${API_URL}/invoice?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/invoice/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInvoices();
      alert('Invoice deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting invoice');
    }
  };

  const generateInvoicePDF = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoice/${invoice._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullInvoice = res.data;
      
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      let yPos = margin;
      
      // Header Section - Two columns: Company Info (Left) and Invoice Details (Right)
      const headerStartY = yPos;
      const leftColX = margin;
      const rightColX = pageWidth - margin - 70;
      
      // Left Column - Company Info
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SOLIDEX', leftColX, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', leftColX, yPos);
      yPos += 5;
      doc.text('2nd Phase, Shivapura, Peenya,', leftColX, yPos);
      yPos += 5;
      doc.text('Bengaluru, Karnataka 560058', leftColX, yPos);
      yPos += 5;
      doc.text('Phone: 098457 24747', leftColX, yPos);
      yPos += 5;
      doc.text('Email: info@solidex.com', leftColX, yPos);
      yPos += 5;
      doc.text('GSTIN: 29AABCU9603R1ZX', leftColX, yPos);
      
      // Right Column - Invoice Details
      yPos = headerStartY;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No:`, rightColX, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(fullInvoice.invoiceNumber || 'N/A', pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Date:`, rightColX, yPos);
      doc.text(new Date(fullInvoice.date).toLocaleDateString('en-GB'), pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      
      if (fullInvoice.dueDate) {
        doc.text(`Due Date:`, rightColX, yPos);
        doc.text(new Date(fullInvoice.dueDate).toLocaleDateString('en-GB'), pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;
      }
      
      doc.text(`Status:`, rightColX, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(fullInvoice.status || 'Draft', pageWidth - margin, yPos, { align: 'right' });
      
      yPos = Math.max(headerStartY + 35, yPos + 10);
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      
      // From and Bill To sections - Two columns
      const fromToStartY = yPos;
      const boxSpacing = 10;
      const availableWidth = pageWidth - 2 * margin;
      const boxWidth = (availableWidth - boxSpacing) / 2;
      const fromBoxX = margin;
      const toBoxX = margin + boxWidth + boxSpacing;
      const labelHeight = 6; // Height for label area
      const contentStartOffset = labelHeight + 2; // Start content well below label
      
      // Calculate content heights first
      // From section content
      let fromContentY = fromToStartY + contentStartOffset;
      fromContentY += 5; // SOLIDEX
      fromContentY += 5; // Address line 1
      fromContentY += 5; // Address line 2
      fromContentY += 5; // Address line 3
      fromContentY += 5; // Phone
      fromContentY += 5; // GSTIN
      const fromContentEndY = fromContentY + 3;
      
      // Bill To section content
      let toContentY = fromToStartY + contentStartOffset;
      toContentY += 5; // Party name
      if (fullInvoice.partyAddress) {
        const addressLines = doc.splitTextToSize(fullInvoice.partyAddress, boxWidth - 8);
        toContentY += addressLines.length * 5;
      }
      if (fullInvoice.partyContact) {
        toContentY += 5;
      }
      if (fullInvoice.partyGSTIN) {
        toContentY += 5;
      }
      const toContentEndY = toContentY + 3;
      
      // Calculate box height
      const maxHeight = Math.max(fromContentEndY, toContentEndY) - fromToStartY;
      const boxHeight = maxHeight + 2;
      
      // Draw borders first
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.rect(fromBoxX, fromToStartY, boxWidth, boxHeight);
      doc.rect(toBoxX, fromToStartY, boxWidth, boxHeight);
      
      // Draw labels on the border line with white background
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const labelBgWidth = 25;
      const labelBgHeight = labelHeight;
      
      // From label on border
      doc.setFillColor(255, 255, 255);
      doc.rect(fromBoxX + 2, fromToStartY - 3, labelBgWidth, labelBgHeight, 'F');
      doc.text('From:', fromBoxX + 2, fromToStartY);
      
      // Bill To label on border
      doc.setFillColor(255, 255, 255);
      doc.rect(toBoxX + 2, fromToStartY - 3, labelBgWidth, labelBgHeight, 'F');
      doc.text('Bill To:', toBoxX + 2, fromToStartY);
      
      // Now draw content - well below the label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // From section content
      let fromY = fromToStartY + contentStartOffset;
      doc.text('SOLIDEX', fromBoxX + 4, fromY);
      fromY += 5;
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', fromBoxX + 4, fromY);
      fromY += 5;
      doc.text('2nd Phase, Shivapura, Peenya,', fromBoxX + 4, fromY);
      fromY += 5;
      doc.text('Bengaluru, Karnataka 560058', fromBoxX + 4, fromY);
      fromY += 5;
      doc.text('Phone: 098457 24747', fromBoxX + 4, fromY);
      fromY += 5;
      doc.text('GSTIN: 29AABCU9603R1ZX', fromBoxX + 4, fromY);
      
      // Bill To section content
      let toY = fromToStartY + contentStartOffset;
      doc.text(fullInvoice.partyName || 'N/A', toBoxX + 4, toY);
      toY += 5;
      if (fullInvoice.partyAddress) {
        const addressLines = doc.splitTextToSize(fullInvoice.partyAddress, boxWidth - 8);
        addressLines.forEach((line: string) => {
          doc.text(line, toBoxX + 4, toY);
          toY += 5;
        });
      }
      if (fullInvoice.partyContact) {
        doc.text(`Contact: ${fullInvoice.partyContact}`, toBoxX + 4, toY);
        toY += 5;
      }
      if (fullInvoice.partyGSTIN) {
        doc.text(`GSTIN: ${fullInvoice.partyGSTIN}`, toBoxX + 4, toY);
        toY += 5;
      }
      
      yPos = Math.max(fromContentEndY, toContentEndY) + 10;
      
      // Items Table
      if (fullInvoice.items && fullInvoice.items.length > 0) {
        const itemsData = fullInvoice.items.map((item: any, index: number) => [
          (index + 1).toString(),
          item.product?.name || 'N/A',
          item.description || '-',
          item.quantity?.toString() || '0',
          `₹${(item.rate || 0).toFixed(2)}`,
          `${item.tax || 0}%`,
          `₹${(item.amount || 0).toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['SL. No.', 'Product', 'Description', 'Qty', 'Rate', 'Tax %', 'Amount']],
          body: itemsData,
          theme: 'grid',
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
            halign: 'left',
            valign: 'middle',
            cellPadding: 4
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [220, 220, 220],
            lineWidth: 0.3,
            halign: 'left',
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center', lineColor: [220, 220, 220], cellPadding: 3 },
            1: { cellWidth: 40, halign: 'left', lineColor: [220, 220, 220], cellPadding: 4 },
            2: { cellWidth: 45, halign: 'left', lineColor: [220, 220, 220], cellPadding: 4 },
            3: { cellWidth: 15, halign: 'center', lineColor: [220, 220, 220], cellPadding: 3 },
            4: { cellWidth: 28, halign: 'right', lineColor: [220, 220, 220], cellPadding: 6 },
            5: { cellWidth: 20, halign: 'center', lineColor: [220, 220, 220], cellPadding: 3 },
            6: { cellWidth: 30, halign: 'right', lineColor: [220, 220, 220], cellPadding: 6 }
          },
          didParseCell: function (data: any) {
            // Ensure Rate and Amount columns are right-aligned in header too
            if (data.section === 'head') {
              if (data.column.index === 4 || data.column.index === 6) {
                data.cell.styles.halign = 'right';
              }
            }
          },
          styles: {
            lineColor: [220, 220, 220],
            lineWidth: 0.3
          },
          margin: { left: margin, right: margin },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.5
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Totals section (right aligned with border box)
      const totalsBoxWidth = 85;
      const totalsBoxX = pageWidth - margin - totalsBoxWidth;
      const totalsStartY = yPos;
      
      // Calculate height needed
      let totalsHeight = 20; // Subtotal + spacing
      if (fullInvoice.discount > 0) totalsHeight += 6;
      if (fullInvoice.tax > 0) totalsHeight += 6;
      if (fullInvoice.shipping > 0) totalsHeight += 6;
      totalsHeight += 10; // Total + spacing
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.setFillColor(250, 250, 250);
      doc.rect(totalsBoxX, totalsStartY, totalsBoxWidth, totalsHeight, 'FD');
      
      yPos = totalsStartY + 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const labelX = totalsBoxX + 5;
      const valueX = pageWidth - margin - 8; // More padding from edge
      
      doc.text('Subtotal:', labelX, yPos);
      doc.text(`₹${(fullInvoice.subtotal || 0).toFixed(2)}`, valueX, yPos, { align: 'right' });
      yPos += 6;
      
      if (fullInvoice.discount > 0) {
        doc.text('Discount:', labelX, yPos);
        doc.text(`-₹${fullInvoice.discount.toFixed(2)}`, valueX, yPos, { align: 'right' });
        yPos += 6;
      }
      
      if (fullInvoice.tax > 0) {
        doc.text('Tax:', labelX, yPos);
        doc.text(`+₹${fullInvoice.tax.toFixed(2)}`, valueX, yPos, { align: 'right' });
        yPos += 6;
      }
      
      if (fullInvoice.shipping > 0) {
        doc.text('Shipping:', labelX, yPos);
        doc.text(`+₹${fullInvoice.shipping.toFixed(2)}`, valueX, yPos, { align: 'right' });
        yPos += 6;
      }
      
      // Total line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(labelX, yPos, valueX, yPos);
      yPos += 4;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', labelX, yPos);
      doc.text(`₹${(fullInvoice.total || 0).toFixed(2)}`, valueX, yPos, { align: 'right' });
      yPos += 15;
      
      // Notes and Payment Terms section
      const notesStartY = yPos;
      const notesBoxWidth = pageWidth - 2 * margin;
      
      if (fullInvoice.notes || fullInvoice.paymentTerms) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 250);
        let notesHeight = 30;
        if (fullInvoice.notes && fullInvoice.paymentTerms) notesHeight = 50;
        doc.rect(margin, notesStartY, notesBoxWidth, notesHeight, 'FD');
        
        yPos = notesStartY + 8;
        
        if (fullInvoice.paymentTerms) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Payment Terms:', margin + 5, yPos);
          yPos += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(fullInvoice.paymentTerms, margin + 5, yPos);
          yPos += 8;
        }
        
        if (fullInvoice.notes) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Notes:', margin + 5, yPos);
          yPos += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const notesLines = doc.splitTextToSize(fullInvoice.notes, notesBoxWidth - 10);
          doc.text(notesLines, margin + 5, yPos);
        }
        
        yPos = notesStartY + notesHeight + 10;
      }
      
      // Footer section
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text('For any queries, please contact us at info@solidex.com or Phone: 098457 24747', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Page numbers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      doc.save(`SOLIDEX_Invoice_${fullInvoice.invoiceNumber || fullInvoice._id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    await generateInvoicePDF(invoice);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Invoice Management</h2>
              <Link 
                href="/admin/invoice/create"
                className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Invoice
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">All Types</option>
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">All Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            {invoice.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{invoice.partyName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{invoice.total.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                            invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link href={`/admin/invoice/${invoice._id}`} className="text-brand-blue hover:underline">View</Link>
                          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                            <Link href={`/admin/invoice/${invoice._id}/edit`} className="text-brand-yellow hover:underline">Edit</Link>
                          )}
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="text-brand-green hover:underline"
                            title="Download PDF"
                          >
                            📥 Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No invoices found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

