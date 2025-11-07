'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface SupervisorCheck {
  _id: string;
  checkNumber: string;
  product: any;
  order: any;
  supervisor: string;
  checkDate: string;
  checkType: string;
  overallStatus: string;
}

export default function SupervisorCheckPage() {
  const [checks, setChecks] = useState<SupervisorCheck[]>([]);
  const [filter, setFilter] = useState({ status: '', checkType: '' });
  const [loading, setLoading] = useState(true);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [checkDetails, setCheckDetails] = useState<any>(null);

  useEffect(() => {
    fetchChecks();
  }, [filter]);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.checkType) params.append('checkType', filter.checkType);
      
      const res = await axios.get(`${API_URL}/supervisor-check?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChecks(res.data);
    } catch (error) {
      console.error('Error fetching supervisor checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (checkId: string) => {
    if (!confirm('Are you sure you want to delete this supervisor check? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/supervisor-check/${checkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchChecks();
      alert('Supervisor check deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting supervisor check');
    }
  };

  const handleViewDetails = async (checkId: string) => {
    if (expandedCheck === checkId) {
      setExpandedCheck(null);
      setCheckDetails(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/supervisor-check/${checkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckDetails(res.data);
      setExpandedCheck(checkId);
    } catch (error) {
      console.error('Error fetching check details:', error);
      alert('Error loading check details');
    }
  };

  const generatePDF = async (checkData: SupervisorCheck | SupervisorCheck[], filename: string) => {
    // Dynamic import for Next.js compatibility
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const isMultiple = Array.isArray(checkData);
    
    if (isMultiple) {
      // For multiple checks, create a summary report
      const doc = new jsPDF();
      const checks = checkData;
      
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
      doc.text('All Supervisor Checks Report', 105, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 47);
      
      const tableData = checks.map((check) => [
        check.checkNumber || 'N/A',
        check.product?.name || 'N/A',
        check.order?.orderNumber || '-',
        check.supervisor || 'N/A',
        new Date(check.checkDate).toLocaleDateString(),
        check.checkType || 'N/A',
        check.overallStatus || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Check #', 'Product', 'Order', 'Supervisor', 'Check Date', 'Type', 'Status']],
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
      // For single check, fetch full details and create professional form
      const check = checkData;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/supervisor-check/${check._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullCheck = res.data;
        
        await generateSupervisorCheckFormPDF(fullCheck, filename, jsPDF, autoTable);
      } catch (error) {
        console.error('Error fetching check details:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const generateSupervisorCheckFormPDF = async (check: any, filename: string, jsPDF: any, autoTable: any) => {
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
    doc.text('SUPERVISOR CHECK FORM', pageWidth / 2, 40, { align: 'center' });
    
    yPos = 47;
    
    // Check Details Section - Grid Form Format
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Check Details', margin, yPos);
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
    
    // Prepare fields in grid format
    let currentRow = 0;
    const fields: Array<{ label: string; value: any; row: number; col: number }> = [
      { label: 'Check Number:', value: check.checkNumber || 'N/A', row: currentRow++, col: 0 },
      { label: 'Check Date:', value: new Date(check.checkDate).toLocaleDateString(), row: currentRow - 1, col: 1 },
      { label: 'Product:', value: check.product?.name || 'N/A', row: currentRow++, col: 0 },
      { label: 'Check Type:', value: check.checkType || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Order:', value: check.order?.orderNumber || '-', row: currentRow++, col: 0 },
      { label: 'Supervisor:', value: check.supervisor || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Batch Number:', value: check.batchNumber || '-', row: currentRow++, col: 0 },
      { label: 'Overall Status:', value: check.overallStatus || 'N/A', row: currentRow - 1, col: 1 }
    ];
    
    // Calculate number of rows needed
    const maxRow = Math.max(...fields.map(f => f.row)) + 1;
    const totalGridHeight = maxRow * cellHeight;
    
    // Draw grid
    for (let row = 0; row <= maxRow; row++) {
      const y = gridStartY + (row * cellHeight);
      doc.line(margin, y, pageWidth - margin, y);
    }
    
    // Vertical lines
    doc.line(margin, gridStartY, margin, gridStartY + totalGridHeight);
    doc.line(rightColStart, gridStartY, rightColStart, gridStartY + totalGridHeight);
    doc.line(pageWidth - margin, gridStartY, pageWidth - margin, gridStartY + totalGridHeight);
    
    // Fill in the fields
    doc.setFontSize(9);
    fields.forEach(field => {
      const y = gridStartY + (field.row * cellHeight) + 5;
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
      const valueLines = doc.splitTextToSize(String(field.value), maxWidth);
      
      valueLines.forEach((line: string, index: number) => {
        doc.text(line, valueX, y + (index * 4));
      });
    });
    
    yPos = gridStartY + totalGridHeight + 10;
    
    // Dimension Checks Section
    if (check.dimensions && check.dimensions.length > 0) {
      yPos += 5;
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Dimension Checks', margin, yPos);
      yPos += 8;
      
      // Prepare dimension table data
      const dimensionData = check.dimensions.map((dim: any, index: number) => [
        (index + 1).toString(),
        dim.parameter || '-',
        dim.specification || '-',
        dim.actualValue || '-',
        dim.tolerance || '-',
        dim.status || 'Pending',
        dim.remarks || '-'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['SL. No.', 'Parameter', 'Specification', 'Actual Value', 'Tolerance', 'Status', 'Remarks']],
        body: dimensionData,
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
    
    // Visual Inspection and Material Check
    yPos += 5;
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Inspection Results', margin, yPos);
    yPos += 8;
    
    // Visual Inspection
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Visual Inspection:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Status: ${check.visualInspection?.status || 'Pending'}`, margin + 5, yPos);
    yPos += 5;
    if (check.visualInspection?.remarks) {
      const remarksLines = doc.splitTextToSize(`Remarks: ${check.visualInspection.remarks}`, pageWidth - 2 * margin - 10);
      doc.text(remarksLines, margin + 5, yPos);
      yPos += remarksLines.length * 5 + 5;
    } else {
      yPos += 5;
    }
    
    // Material Check
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Material Check:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Status: ${check.materialCheck?.status || 'Pending'}`, margin + 5, yPos);
    yPos += 5;
    if (check.materialCheck?.remarks) {
      const remarksLines = doc.splitTextToSize(`Remarks: ${check.materialCheck.remarks}`, pageWidth - 2 * margin - 10);
      doc.text(remarksLines, margin + 5, yPos);
      yPos += remarksLines.length * 5 + 5;
    } else {
      yPos += 5;
    }
    
    // Overall Remarks
    if (check.remarks) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Remarks:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const remarksLines = doc.splitTextToSize(check.remarks, pageWidth - 2 * margin);
      doc.text(remarksLines, margin, yPos);
      yPos += remarksLines.length * 5 + 5;
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

  const handleDownloadIndividual = async (check: SupervisorCheck) => {
    await generatePDF(check, `SOLIDEX_SupervisorCheck_${check.checkNumber || check._id}.pdf`);
  };

  const handleDownloadAll = async () => {
    if (checks.length === 0) {
      alert('No supervisor checks to download');
      return;
    }
    await generatePDF(checks, `SOLIDEX_All_SupervisorChecks_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Supervisor Checks</h2>
              <div className="flex gap-2">
                {checks.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Download All PDF
                  </button>
                )}
                <Link 
                  href="/admin/supervisor-check/create"
                  className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Check
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-2 gap-4">
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
                    <option value="Conditional Pass">Conditional Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Type</label>
                  <select
                    value={filter.checkType}
                    onChange={(e) => setFilter({ ...filter, checkType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">All Types</option>
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="In-Process">In-Process</option>
                    <option value="Final">Final</option>
                    <option value="Random">Random</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checks.map((check) => (
                      <React.Fragment key={check._id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{check.checkNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{check.product?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{check.order?.orderNumber || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{check.supervisor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(check.checkDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                              {check.checkType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded ${
                              check.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' :
                              check.overallStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                              check.overallStatus === 'Conditional Pass' ? 'bg-yellow-100 text-yellow-800' :
                              check.overallStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {check.overallStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleViewDetails(check._id)}
                              className="text-brand-blue hover:underline"
                            >
                              {expandedCheck === check._id ? 'Hide' : 'View'}
                            </button>
                            <Link href={`/admin/supervisor-check/${check._id}/edit`} className="text-brand-yellow hover:underline">Edit</Link>
                            <button
                              onClick={() => handleDownloadIndividual(check)}
                              className="text-brand-green hover:underline"
                              title="Download PDF"
                            >
                              📥 PDF
                            </button>
                            <button
                              onClick={() => handleDelete(check._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        {expandedCheck === check._id && checkDetails && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                {/* Dimension Checks Table */}
                                {checkDetails.dimensions && checkDetails.dimensions.length > 0 && (
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Dimension Checks</h3>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Parameter</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Specification</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Actual Value</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Tolerance</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Remarks</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {checkDetails.dimensions.map((dim: any, index: number) => (
                                            <tr key={index}>
                                              <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{dim.parameter || '-'}</td>
                                              <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{dim.specification || '-'}</td>
                                              <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{dim.actualValue || '-'}</td>
                                              <td className="px-4 py-2 text-sm text-gray-500 border border-gray-300">{dim.tolerance || '-'}</td>
                                              <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                  dim.status === 'Pass' ? 'bg-green-100 text-green-800' :
                                                  dim.status === 'Fail' ? 'bg-red-100 text-red-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {dim.status || 'Pending'}
                                                </span>
                                              </td>
                                              <td className="px-4 py-2 text-sm text-gray-500 border border-gray-300">{dim.remarks || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Visual Inspection and Material Check */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Visual Inspection</label>
                                    <span className={`inline-block px-3 py-1 text-sm rounded ${
                                      checkDetails.visualInspection?.status === 'Pass' ? 'bg-green-100 text-green-800' :
                                      checkDetails.visualInspection?.status === 'Fail' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {checkDetails.visualInspection?.status || 'Pending'}
                                    </span>
                                    {checkDetails.visualInspection?.remarks && (
                                      <p className="text-sm text-gray-600 mt-2">{checkDetails.visualInspection.remarks}</p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Material Check</label>
                                    <span className={`inline-block px-3 py-1 text-sm rounded ${
                                      checkDetails.materialCheck?.status === 'Pass' ? 'bg-green-100 text-green-800' :
                                      checkDetails.materialCheck?.status === 'Fail' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {checkDetails.materialCheck?.status || 'Pending'}
                                    </span>
                                    {checkDetails.materialCheck?.remarks && (
                                      <p className="text-sm text-gray-600 mt-2">{checkDetails.materialCheck.remarks}</p>
                                    )}
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
                {checks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No supervisor checks found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

