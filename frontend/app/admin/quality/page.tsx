'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface QualityCheck {
  _id: string;
  qcNumber: string;
  type: string;
  date: string;
  inspector: string;
  overallStatus: string;
  items: any[];
  dcReference?: any;
}

export default function QualityCheckPage() {
  const [qcs, setQcs] = useState<QualityCheck[]>([]);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [expandedQC, setExpandedQC] = useState<string | null>(null);
  const [qcDetails, setQcDetails] = useState<any>(null);

  useEffect(() => {
    fetchQCs();
  }, [filter]);

  const fetchQCs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      
      const res = await axios.get(`${API_URL}/quality?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQcs(res.data);
    } catch (error) {
      console.error('Error fetching quality checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qcId: string) => {
    if (!confirm('Are you sure you want to delete this quality check? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/quality/${qcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQCs();
      alert('Quality check deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting quality check');
    }
  };

  const handleViewDetails = async (qcId: string) => {
    if (expandedQC === qcId) {
      setExpandedQC(null);
      setQcDetails(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/quality/${qcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQcDetails(res.data);
      setExpandedQC(qcId);
    } catch (error) {
      console.error('Error fetching QC details:', error);
      alert('Error loading QC details');
    }
  };

  const generatePDF = async (qcData: QualityCheck | QualityCheck[], filename: string) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const isMultiple = Array.isArray(qcData);
    
    if (isMultiple) {
      const doc = new jsPDF();
      const qcs = qcData;
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('SOLI', 14, 18);
      doc.setTextColor(255, 0, 0);
      const soliWidth = doc.getTextWidth('SOLI');
      doc.text('DEX', 14 + soliWidth, 18);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Manufacturing Excellence', 14, 26);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('All Quality Checks Report', 105, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 47);
      
      const tableData = qcs.map((qc) => [
        qc.qcNumber || 'N/A',
        qc.type || 'N/A',
        new Date(qc.date).toLocaleDateString(),
        qc.inspector || 'N/A',
        qc.items.length.toString(),
        qc.overallStatus || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['QC Number', 'Type', 'Date', 'Inspector', 'Items', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { fontSize: 8, cellPadding: 3 }
      });
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 277, 196, 277);
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
      const qc = qcData;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/quality/${qc._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullQC = res.data;
        
        await generateQualityCheckFormPDF(fullQC, filename, jsPDF, autoTable);
      } catch (error) {
        console.error('Error fetching QC details:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const generateQualityCheckFormPDF = async (qc: any, filename: string, jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    let yPos = margin;
    
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('SOLI', margin, 18);
    doc.setTextColor(255, 0, 0);
    const soliWidth = doc.getTextWidth('SOLI');
    doc.text('DEX', margin + soliWidth, 18);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Manufacturing Excellence', margin, 26);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageWidth - margin, 30);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('QUALITY CHECK FORM', pageWidth / 2, 40, { align: 'center' });
    
    yPos = 47;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Check Details', margin, yPos);
    yPos += 8;
    
    const gridStartY = yPos;
    const cellHeight = 8;
    const leftColWidth = 90;
    const rightColWidth = pageWidth - 2 * margin - leftColWidth;
    const rightColStart = margin + leftColWidth;
    
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    
    let currentRow = 0;
    const fields: Array<{ label: string; value: any; row: number; col: number }> = [
      { label: 'QC Number:', value: qc.qcNumber || 'N/A', row: currentRow++, col: 0 },
      { label: 'Date:', value: new Date(qc.date).toLocaleDateString(), row: currentRow - 1, col: 1 },
      { label: 'Type:', value: qc.type || 'N/A', row: currentRow++, col: 0 },
      { label: 'Inspector:', value: qc.inspector || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'DC Reference:', value: qc.dcReference?.dcNumber || '-', row: currentRow++, col: 0 },
      { label: 'Overall Status:', value: qc.overallStatus || 'N/A', row: currentRow - 1, col: 1 }
    ];
    
    const maxRow = Math.max(...fields.map(f => f.row)) + 1;
    const totalGridHeight = maxRow * cellHeight;
    
    for (let row = 0; row <= maxRow; row++) {
      const y = gridStartY + (row * cellHeight);
      doc.line(margin, y, pageWidth - margin, y);
    }
    
    doc.line(margin, gridStartY, margin, gridStartY + totalGridHeight);
    doc.line(rightColStart, gridStartY, rightColStart, gridStartY + totalGridHeight);
    doc.line(pageWidth - margin, gridStartY, pageWidth - margin, gridStartY + totalGridHeight);
    
    doc.setFontSize(9);
    fields.forEach(field => {
      const y = gridStartY + (field.row * cellHeight) + 5;
      const x = field.col === 0 ? margin + 2 : rightColStart + 2;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(field.label, x, y);
      
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(field.label);
      const valueX = x + labelWidth + 2;
      const maxWidth = (field.col === 0 ? leftColWidth : rightColWidth) - labelWidth - 4;
      const valueLines = doc.splitTextToSize(String(field.value), maxWidth);
      
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, valueX, y + (index * 4));
      });
    });
    
    yPos = gridStartY + totalGridHeight + 10;
    
    if (qc.items && qc.items.length > 0) {
      yPos += 5;
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Items Checked', margin, yPos);
      yPos += 8;
      
      const itemsData = qc.items.map((item: any, index: number) => [
        (index + 1).toString(),
        item.product?.name || 'N/A',
        item.quantity?.toString() || '0',
        item.batchNumber || 'N/A',
        item.checkedQuantity?.toString() || '0',
        item.passedQuantity?.toString() || '0',
        item.failedQuantity?.toString() || '0',
        item.status || 'Pending'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['SL. No.', 'Product', 'Quantity', 'Batch Number', 'Checked', 'Passed', 'Failed', 'Status']],
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
        margin: { left: margin, right: margin }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (qc.remarks) {
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
      const remarksLines = doc.splitTextToSize(qc.remarks, pageWidth - 2 * margin);
      doc.text(remarksLines, margin, yPos);
    }
    
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
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

  const handleDownloadIndividual = async (qc: QualityCheck) => {
    await generatePDF(qc, `SOLIDEX_QualityCheck_${qc.qcNumber || qc._id}.pdf`);
  };

  const handleDownloadAll = async () => {
    if (qcs.length === 0) {
      alert('No quality checks to download');
      return;
    }
    await generatePDF(qcs, `SOLIDEX_All_QualityChecks_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Quality Check Management</h2>
              <div className="flex gap-2">
                {qcs.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Download All PDF
                  </button>
                )}
                <Link 
                  href="/admin/quality/create"
                  className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Quality Check
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
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Production">Production</option>
                    <option value="Rework">Rework</option>
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
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Partial">Partial</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QC Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {qcs.map((qc) => (
                      <React.Fragment key={qc._id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{qc.qcNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                              {qc.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(qc.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{qc.inspector}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{qc.items.length} items</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              qc.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' :
                              qc.overallStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                              qc.overallStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                              qc.overallStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {qc.overallStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleViewDetails(qc._id)}
                              className="text-brand-blue hover:underline"
                            >
                              {expandedQC === qc._id ? 'Hide' : 'View'}
                            </button>
                            <Link href={`/admin/quality/${qc._id}/edit`} className="text-brand-yellow hover:underline">Edit</Link>
                            <button
                              onClick={() => handleDownloadIndividual(qc)}
                              className="text-brand-green hover:underline"
                              title="Download PDF"
                            >
                              📥 PDF
                            </button>
                            <button
                              onClick={() => handleDelete(qc._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        {expandedQC === qc._id && qcDetails && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Items Checked</h3>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Quantity</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Batch Number</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {qcDetails.items.map((item: any, index: number) => (
                                        <tr key={index}>
                                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{item.product?.name || 'N/A'}</td>
                                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{item.quantity || '-'}</td>
                                          <td className="px-4 py-2 text-sm text-gray-500 border border-gray-300">{item.batchNumber || 'N/A'}</td>
                                          <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                              item.status === 'Passed' ? 'bg-green-100 text-green-800' :
                                              item.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                              item.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {item.status || 'Pending'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                {/* Summary Section */}
                                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Summary</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-sm text-gray-700">Checked: </span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {qcDetails.items.reduce((sum: number, item: any) => sum + (item.checkedQuantity || 0), 0)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-700">Passed: </span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {qcDetails.items.reduce((sum: number, item: any) => sum + (item.passedQuantity || 0), 0)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-700">Failed: </span>
                                      <span className="text-sm font-semibold text-red-600">
                                        {qcDetails.items.reduce((sum: number, item: any) => sum + (item.failedQuantity || 0), 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                {qcs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No quality checks found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

