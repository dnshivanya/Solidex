'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DC {
  _id: string;
  dcNumber: string;
  type: 'Inward' | 'Outward';
  date: string;
  partyName: string;
  status: string;
  items: any[];
}

export default function DCPage() {
  const [dcs, setDcs] = useState<DC[]>([]);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDCs();
  }, [filter]);

  const fetchDCs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      
      const res = await axios.get(`${API_URL}/dc?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDcs(res.data);
    } catch (error) {
      console.error('Error fetching DCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (dcId: string) => {
    if (!confirm('Complete this DC and update stock?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/dc/${dcId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDCs();
      alert('DC completed successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error completing DC');
    }
  };

  const handleDelete = async (dcId: string) => {
    const dc = dcs.find(d => d._id === dcId);
    const warningMessage = dc?.status === 'Completed' 
      ? 'Warning: This DC is completed and may have affected stock. Are you sure you want to delete it? This action cannot be undone.'
      : 'Are you sure you want to delete this DC? This action cannot be undone.';
    
    if (!confirm(warningMessage)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/dc/${dcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDCs();
      alert('DC deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting DC');
    }
  };

  const generateDCPDF = async (dc: DC) => {
    try {
      // Fetch full DC details
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dc/${dc._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullDC = res.data;
      
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      let yPos = margin;
      
      // Company Name - SOLIDEX (centered, large, bold)
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SOLIDEX', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      // Company Address (centered)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      // Document Title - "Non-Returnable Delivery Challan" (centered, bold)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Non-Returnable Delivery Challan', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // DC Number and Date (left and right aligned)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`DC No: ${fullDC.dcNumber || 'N/A'}`, margin, yPos);
      doc.text(`Date: ${new Date(fullDC.date).toLocaleDateString('en-GB')}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;
      
      // From and To sections with borders
      const boxSpacing = 4; // Space between the two boxes
      const availableWidth = pageWidth - 2 * margin;
      const boxWidth = (availableWidth - boxSpacing) / 2;
      const fromBoxX = margin;
      const toBoxX = margin + boxWidth + boxSpacing;
      const fromToStartY = yPos; // Start border at label position
      const fromContentStartY = yPos + 6; // Start content below the border line
      
      // Calculate content heights first
      // From section content
      let fromCurrentY = fromContentStartY + 5;
      fromCurrentY += 5; // Address line 1
      fromCurrentY += 5; // Address line 2
      fromCurrentY += 5; // Phone line
      const fromContentEndY = fromCurrentY + 3;
      
      // To section content
      let toContentEndY = fromContentStartY + 5; // Party name
      if (fullDC.partyAddress) {
        const addressLines = doc.splitTextToSize(fullDC.partyAddress, boxWidth - 4);
        toContentEndY = fromContentStartY + 5 + (addressLines.length * 5);
      }
      if (fullDC.partyContact) {
        const addressLineCount = fullDC.partyAddress ? doc.splitTextToSize(fullDC.partyAddress, boxWidth - 4).length : 0;
        const contactY = fromContentStartY + 10 + (addressLineCount * 5);
        toContentEndY = contactY + 3;
      }
      
      // Calculate box height
      const maxHeight = Math.max(fromContentEndY, toContentEndY) - fromToStartY;
      const boxHeight = maxHeight + 2;
      
      // Draw borders first
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(fromBoxX, fromToStartY, boxWidth, boxHeight);
      doc.rect(toBoxX, fromToStartY, boxWidth, boxHeight);
      
      // Draw labels on the border line with white background
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const labelBgWidth = 15;
      
      // From label on border
      doc.setFillColor(255, 255, 255);
      doc.rect(fromBoxX + 2, fromToStartY - 3, labelBgWidth, 6, 'F');
      doc.text('From:', fromBoxX + 2, fromToStartY);
      
      // To label on border
      doc.setFillColor(255, 255, 255);
      doc.rect(toBoxX + 2, fromToStartY - 3, labelBgWidth, 6, 'F');
      doc.text('To:', toBoxX + 2, fromToStartY);
      
      // Now draw content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // From section content
      doc.text('SOLIDEX', fromBoxX + 2, fromContentStartY);
      let fromY = fromContentStartY + 5;
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', fromBoxX + 2, fromY);
      fromY += 5;
      doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', fromBoxX + 2, fromY);
      fromY += 5;
      doc.text('Phone: 098457 24747', fromBoxX + 2, fromY);
      
      // To section content
      const toStartY = fromContentStartY;
      doc.text(fullDC.partyName || 'N/A', toBoxX + 2, toStartY);
      if (fullDC.partyAddress) {
        const addressLines = doc.splitTextToSize(fullDC.partyAddress, boxWidth - 4);
        addressLines.forEach((line: string, index: number) => {
          doc.text(line, toBoxX + 2, toStartY + 5 + (index * 5));
        });
      }
      if (fullDC.partyContact) {
        const addressLineCount = fullDC.partyAddress ? doc.splitTextToSize(fullDC.partyAddress, boxWidth - 4).length : 0;
        const contactY = toStartY + 10 + (addressLineCount * 5);
        doc.text(`Phone: ${fullDC.partyContact}`, toBoxX + 2, contactY);
      }
      
      yPos = Math.max(fromContentEndY, toContentEndY) + 6;
      
      // Items Table
      if (fullDC.items && fullDC.items.length > 0) {
        const itemsData = fullDC.items.map((item: any, index: number) => [
          (index + 1).toString(),
          item.product?.name || 'N/A',
          `${item.quantity || 0} ${item.unit || 'PCS'}`,
          item.description || '-'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['SL. No.', 'Product Description', 'Quantity', 'Description']],
          body: itemsData,
          theme: 'grid',
          headStyles: {
            fillColor: false,
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            fontSize: 9,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
            halign: 'left',
            valign: 'middle'
          },
          bodyStyles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            halign: 'left',
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center', lineColor: [0, 0, 0] },
            1: { cellWidth: 'auto', lineColor: [0, 0, 0] },
            2: { cellWidth: 40, halign: 'center', lineColor: [0, 0, 0] },
            3: { cellWidth: 'auto', lineColor: [0, 0, 0] }
          },
          styles: {
            lineColor: [0, 0, 0],
            lineWidth: 0.3
          },
          margin: { left: margin, right: margin },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.5
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Notes/Instructions
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('1. Complaints will be entertained if the goods are received within 24hrs of delivery', margin, yPos);
      yPos += 5;
      doc.text('2. Goods are delivered after careful checking', margin, yPos);
      yPos += 15;
      
      // Signature lines
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      // Initiated by
      doc.line(margin, yPos, margin + 50, yPos);
      doc.setFontSize(8);
      doc.text('Initiated by', margin, yPos + 5);
      
      // Received by (centered)
      doc.line(pageWidth / 2 - 25, yPos, pageWidth / 2 + 25, yPos);
      doc.text('Received by', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Issued by (right aligned)
      doc.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos);
      doc.text('Issued by', pageWidth - margin, yPos + 5, { align: 'right' });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      doc.save(`SOLIDEX_DC_${fullDC.dcNumber || fullDC._id}.pdf`);
    } catch (error) {
      console.error('Error generating DC PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadDC = async (dc: DC) => {
    await generateDCPDF(dc);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Delivery Challan Management</h2>
              <div className="flex space-x-4">
                <Link 
                  href="/admin/dc/create?type=Inward"
                  className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Inward DC
                </Link>
                <Link 
                  href="/admin/dc/create?type=Outward"
                  className="bg-brand-yellow text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Create Outward DC
                </Link>
              </div>
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
                    <option value="Inward">Inward</option>
                    <option value="Outward">Outward</option>
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
                    <option value="Completed">Completed</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DC Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dcs.map((dc) => (
                      <tr key={dc._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dc.dcNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            dc.type === 'Inward' ? 'bg-brand-green text-white' : 'bg-brand-yellow text-white'
                          }`}>
                            {dc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(dc.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{dc.partyName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{dc.items.length} items</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            dc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            dc.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link href={`/admin/dc/${dc._id}`} className="text-brand-blue hover:underline">View</Link>
                          <button
                            onClick={() => handleDownloadDC(dc)}
                            className="text-brand-green hover:underline"
                            title="Download PDF"
                          >
                            📥 PDF
                          </button>
                          {dc.status === 'Draft' && (
                            <>
                              <Link href={`/admin/dc/${dc._id}/edit`} className="text-brand-yellow hover:underline">Edit</Link>
                              <button
                                onClick={() => handleComplete(dc._id)}
                                className="text-brand-green hover:underline"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(dc._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dcs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No DCs found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

