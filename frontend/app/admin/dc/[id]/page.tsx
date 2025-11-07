'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DCItem {
  product: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  unit: string;
  description: string;
}

interface DC {
  _id: string;
  dcNumber: string;
  type: 'Inward' | 'Outward';
  date: string;
  partyName: string;
  partyAddress: string;
  partyContact: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  remarks: string;
  status: string;
  items: DCItem[];
}

export default function DCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dc, setDc] = useState<DC | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDC(params.id as string);
    }
  }, [params.id]);

  const fetchDC = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/dc/${id}`);
      setDc(res.data);
    } catch (error) {
      console.error('Error fetching DC:', error);
      alert('DC not found');
      router.push('/admin/dc');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Complete this DC and update stock?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/dc/${dc?._id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDC(dc!._id);
      alert('DC completed successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error completing DC');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this DC? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/dc/${dc?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/dc');
      alert('DC deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting DC');
    }
  };

  const generateDCPDF = async () => {
    if (!dc) return;
    
    try {
      // Dynamic import for Next.js compatibility
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      let yPos = margin;
      
      // Company Name - SOLIDEX (centered, large, bold)
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SOLIDEX', pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;
      
      // Company Address (centered)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;
      
      // Document Title - "Non-Returnable Delivery Challan" (centered, bold)
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Non-Returnable Delivery Challan', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      // DC Number and Date (left and right aligned)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`DC No: ${dc.dcNumber || 'N/A'}`, margin, yPos);
      doc.text(`Date: ${new Date(dc.date).toLocaleDateString('en-GB')}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 8;
      
      // From and To sections with borders
      const fromToStartY = yPos;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('From:', margin, yPos);
      doc.text('To:', pageWidth / 2 + 5, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      // From section
      const fromContentStartY = yPos;
      doc.text('SOLIDEX', margin + 2, yPos);
      yPos += 4;
      doc.text('No 25, A/2, NTTF circle, opposite Peenya Gymkhana,', margin + 2, yPos);
      yPos += 4;
      doc.text('2nd Phase, Shivapura, Peenya, Bengaluru, Karnataka 560058', margin + 2, yPos);
      yPos += 4;
      doc.text('Phone: 098457 24747', margin + 2, yPos);
      const fromContentEndY = yPos + 3;
      
      // To section
      const toStartY = fromContentStartY;
      let toContentEndY = toStartY + 4;
      doc.text(dc.partyName || 'N/A', pageWidth / 2 + 7, toStartY);
      if (dc.partyAddress) {
        const addressLines = doc.splitTextToSize(dc.partyAddress, pageWidth / 2 - margin - 10);
        addressLines.forEach((line: string, index: number) => {
          doc.text(line, pageWidth / 2 + 7, toStartY + 4 + (index * 4));
        });
        toContentEndY = toStartY + 4 + (addressLines.length * 4);
      }
      if (dc.partyContact) {
        const contactY = toStartY + 8 + (dc.partyAddress ? doc.splitTextToSize(dc.partyAddress, pageWidth / 2 - margin - 10).length * 4 : 0);
        doc.text(`Phone: ${dc.partyContact}`, pageWidth / 2 + 7, contactY);
        toContentEndY = contactY + 3;
      }
      
      // Draw borders around From and To sections (grey)
      const maxHeight = Math.max(fromContentEndY, toContentEndY) - fromToStartY;
      const boxHeight = maxHeight + 2;
      const fromBoxWidth = pageWidth / 2 - margin - 2;
      const toBoxWidth = pageWidth - margin - (pageWidth / 2 + 2);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, fromToStartY, fromBoxWidth, boxHeight);
      doc.rect(pageWidth / 2 + 2, fromToStartY, toBoxWidth, boxHeight);
      
      yPos = Math.max(fromContentEndY, toContentEndY) + 6;
      
      // Items Table
      if (dc.items && dc.items.length > 0) {
        const itemsData = dc.items.map((item: any, index: number) => [
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
            fontSize: 8,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
            halign: 'left',
            valign: 'middle',
            cellPadding: 3
          },
          bodyStyles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
            halign: 'left',
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 18, halign: 'center', lineColor: [0, 0, 0] },
            1: { cellWidth: 'auto', lineColor: [0, 0, 0] },
            2: { cellWidth: 35, halign: 'center', lineColor: [0, 0, 0] },
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
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('1. Complaints will be entertained if the goods are received within 24hrs of delivery', margin, yPos);
      yPos += 4;
      doc.text('2. Goods are delivered after careful checking', margin, yPos);
      yPos += 12;
      
      // Signature lines
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      // Initiated by
      doc.line(margin, yPos, margin + 50, yPos);
      doc.setFontSize(7);
      doc.text('Initiated by', margin, yPos + 4);
      
      // Received by (centered)
      doc.line(pageWidth / 2 - 25, yPos, pageWidth / 2 + 25, yPos);
      doc.text('Received by', pageWidth / 2, yPos + 4, { align: 'center' });
      
      // Issued by (right aligned)
      doc.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos);
      doc.text('Issued by', pageWidth - margin, yPos + 4, { align: 'right' });
      
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      doc.save(`SOLIDEX_DC_${dc.dcNumber || dc._id}.pdf`);
    } catch (error) {
      console.error('Error generating DC PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadDC = async () => {
    await generateDCPDF();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dc) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">DC Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadDC}
                  className="px-4 py-2 bg-brand-green text-white rounded hover:bg-green-600 flex items-center gap-2"
                >
                  <span>📥</span>
                  Download PDF
                </button>
                {dc.status === 'Draft' && (
                  <Link
                    href={`/admin/dc/${dc._id}/edit`}
                    className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                )}
                <Link
                  href="/admin/dc"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back to List
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">DC Number</label>
                  <p className="text-lg font-semibold text-gray-900">{dc.dcNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded ${
                    dc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    dc.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {dc.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded ${
                    dc.type === 'Inward' ? 'bg-brand-green text-white' : 'bg-brand-yellow text-white'
                  }`}>
                    {dc.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p className="text-gray-900">{new Date(dc.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Party Name</label>
                    <p className="text-gray-900">{dc.partyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                    <p className="text-gray-900">{dc.partyContact || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-gray-900">{dc.partyAddress || '-'}</p>
                  </div>
                </div>
              </div>

              {(dc.vehicleNumber || dc.driverName) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Number</label>
                      <p className="text-gray-900">{dc.vehicleNumber || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                      <p className="text-gray-900">{dc.driverName || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Driver Contact</label>
                      <p className="text-gray-900">{dc.driverContact || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dc.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.product?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.unit || 'PCS'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {dc.remarks && (
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
                  <p className="text-gray-900">{dc.remarks}</p>
                </div>
              )}

              {dc.status === 'Draft' && (
                <div className="border-t border-gray-200 pt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete DC
                  </button>
                  <button
                    onClick={handleComplete}
                    className={`px-6 py-2 rounded text-white ${
                      dc.type === 'Inward' 
                        ? 'bg-brand-green hover:bg-green-600' 
                        : 'bg-brand-yellow hover:bg-yellow-600'
                    }`}
                  >
                    Complete DC
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

