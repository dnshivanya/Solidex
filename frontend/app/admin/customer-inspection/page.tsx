'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Inspection {
  _id: string;
  inspectionNumber: string;
  customerName: string;
  scheduledDate: string;
  actualDate: string;
  inspectionType: string;
  overallStatus: string;
  order: any;
}

export default function CustomerInspectionPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState({ status: '' });
  const [loading, setLoading] = useState(true);
  const [expandedInspection, setExpandedInspection] = useState<string | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);

  useEffect(() => {
    fetchInspections();
  }, [filter]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      
      const res = await axios.get(`${API_URL}/customer-inspection?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspections(res.data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inspectionId: string) => {
    if (!confirm('Are you sure you want to delete this inspection? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/customer-inspection/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInspections();
      alert('Inspection deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting inspection');
    }
  };

  const handleViewDetails = async (inspectionId: string) => {
    if (expandedInspection === inspectionId) {
      setExpandedInspection(null);
      setInspectionDetails(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/customer-inspection/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspectionDetails(res.data);
      setExpandedInspection(inspectionId);
    } catch (error) {
      console.error('Error fetching inspection details:', error);
      alert('Error loading inspection details');
    }
  };

  const generatePDF = async (inspectionData: Inspection | Inspection[], filename: string) => {
    // Dynamic import for Next.js compatibility
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const isMultiple = Array.isArray(inspectionData);
    
    if (isMultiple) {
      // For multiple inspections, create a summary report
      const doc = new jsPDF();
      const inspections = inspectionData;
      
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
      doc.text('All Customer Inspections Report', 105, 40, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 47);
      
      const tableData = inspections.map((inspection) => [
        inspection.inspectionNumber || 'N/A',
        inspection.customerName || 'N/A',
        inspection.order?.orderNumber || '-',
        new Date(inspection.scheduledDate).toLocaleDateString(),
        inspection.inspectionType || 'N/A',
        inspection.overallStatus || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 50,
        head: [['Inspection #', 'Customer', 'Order', 'Scheduled Date', 'Type', 'Status']],
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
      // For single inspection, fetch full details and create professional form
      const inspection = inspectionData;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/customer-inspection/${inspection._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullInspection = res.data;
        
        await generateInspectionFormPDF(fullInspection, filename, jsPDF, autoTable);
      } catch (error) {
        console.error('Error fetching inspection details:', error);
        alert('Error generating PDF. Please try again.');
      }
    }
  };

  const generateInspectionFormPDF = async (inspection: any, filename: string, jsPDF: any, autoTable: any) => {
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
    doc.text('CUSTOMER INSPECTION FORM', pageWidth / 2, 40, { align: 'center' });
    
    yPos = 47;
    
    // Inspection Details Section - Grid Form Format
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Inspection Details', margin, yPos);
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
      { label: 'Inspection Number:', value: inspection.inspectionNumber || 'N/A', row: currentRow++, col: 0 },
      { label: 'Scheduled Date:', value: new Date(inspection.scheduledDate).toLocaleDateString(), row: currentRow - 1, col: 1 },
      { label: 'Customer Name:', value: inspection.customerName || 'N/A', row: currentRow++, col: 0 },
      { label: 'Inspection Type:', value: inspection.inspectionType || 'N/A', row: currentRow - 1, col: 1 },
      { label: 'Order:', value: inspection.order?.orderNumber || '-', row: currentRow++, col: 0 },
      { label: 'Overall Status:', value: inspection.overallStatus || 'N/A', row: currentRow - 1, col: 1 }
    ];
    
    if (inspection.actualDate) {
      fields.push({ label: 'Actual Date:', value: new Date(inspection.actualDate).toLocaleDateString(), row: currentRow++, col: 0 });
    }
    
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
    
    // Customer Team Section
    if (inspection.customerTeam && inspection.customerTeam.length > 0) {
      yPos += 5;
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Team', margin, yPos);
      yPos += 8;
      
      const teamData = inspection.customerTeam.map((member: any, index: number) => [
        (index + 1).toString(),
        member.name || '-',
        member.designation || '-',
        member.contact || '-'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['SL. No.', 'Name', 'Designation', 'Contact']],
        body: teamData,
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
    
    // Inspection Items Section
    if (inspection.items && inspection.items.length > 0) {
      yPos += 5;
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Items', margin, yPos);
      yPos += 8;
      
      const itemsData = inspection.items.map((item: any, index: number) => [
        (index + 1).toString(),
        item.product?.name || 'N/A',
        item.quantity || '-',
        item.inspectedQuantity || '-',
        item.passedQuantity || '-',
        item.rejectedQuantity || '-',
        item.remarks || '-'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['SL. No.', 'Product', 'Quantity', 'Inspected', 'Passed', 'Rejected', 'Remarks']],
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
    
    // Remarks Section
    yPos += 5;
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    if (inspection.customerRemarks || inspection.internalRemarks) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Remarks', margin, yPos);
      yPos += 8;
      
      if (inspection.customerRemarks) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Remarks:', margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const remarksLines = doc.splitTextToSize(inspection.customerRemarks, pageWidth - 2 * margin);
        doc.text(remarksLines, margin, yPos);
        yPos += remarksLines.length * 5 + 5;
      }
      
      if (inspection.internalRemarks) {
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Internal Remarks:', margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const remarksLines = doc.splitTextToSize(inspection.internalRemarks, pageWidth - 2 * margin);
        doc.text(remarksLines, margin, yPos);
        yPos += remarksLines.length * 5 + 5;
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

  const handleDownloadIndividual = async (inspection: Inspection) => {
    await generatePDF(inspection, `SOLIDEX_CustomerInspection_${inspection.inspectionNumber || inspection._id}.pdf`);
  };

  const handleDownloadAll = async () => {
    if (inspections.length === 0) {
      alert('No inspections to download');
      return;
    }
    await generatePDF(inspections, `SOLIDEX_All_CustomerInspections_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Customer Inspections</h2>
              <div className="flex gap-2">
                {inspections.length > 0 && (
                  <button
                    onClick={handleDownloadAll}
                    className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>📥</span>
                    Download All PDF
                  </button>
                )}
                <Link 
                  href="/admin/customer-inspection/create"
                  className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Schedule Inspection
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Conditional Approval">Conditional Approval</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspection #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inspections.map((inspection) => (
                      <React.Fragment key={inspection._id}>
                        <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inspection.inspectionNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{inspection.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{inspection.order?.orderNumber || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(inspection.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            {inspection.inspectionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            inspection.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' :
                            inspection.overallStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                            inspection.overallStatus === 'Conditional Approval' ? 'bg-yellow-100 text-yellow-800' :
                            inspection.overallStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inspection.overallStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleViewDetails(inspection._id)}
                            className="text-brand-blue hover:underline"
                          >
                            {expandedInspection === inspection._id ? 'Hide' : 'View'}
                          </button>
                          <Link href={`/admin/customer-inspection/${inspection._id}/edit`} className="text-brand-yellow hover:underline">Edit</Link>
                          <button
                            onClick={() => handleDownloadIndividual(inspection)}
                            className="text-brand-green hover:underline"
                            title="Download PDF"
                          >
                            📥 PDF
                          </button>
                          <button
                            onClick={() => handleDelete(inspection._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedInspection === inspection._id && inspectionDetails && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Inspection Items Table */}
                              {inspectionDetails.items && inspectionDetails.items.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspection Items</h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">SL. No.</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Product</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Quantity</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Inspected</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Passed</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Rejected</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Remarks</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {inspectionDetails.items.map((item: any, index: number) => (
                                          <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{index + 1}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{item.product?.name || 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{item.quantity || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{item.inspectedQuantity || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-green-600 font-semibold border border-gray-300">{item.passedQuantity || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-red-600 font-semibold border border-gray-300">{item.rejectedQuantity || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500 border border-gray-300">{item.remarks || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              
                              {/* Customer Team */}
                              {inspectionDetails.customerTeam && inspectionDetails.customerTeam.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Team</h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Name</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Designation</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300">Contact</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {inspectionDetails.customerTeam.map((member: any, index: number) => (
                                          <tr key={index}>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{member.name || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{member.designation || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500 border border-gray-300">{member.contact || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              
                              {/* Remarks */}
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                {inspectionDetails.customerRemarks && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Remarks</label>
                                    <p className="text-sm text-gray-600">{inspectionDetails.customerRemarks}</p>
                                  </div>
                                )}
                                {inspectionDetails.internalRemarks && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal Remarks</label>
                                    <p className="text-sm text-gray-600">{inspectionDetails.internalRemarks}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
                {inspections.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No inspections found</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

