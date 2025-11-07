'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoice/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoice(res.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/invoice/${params.id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInvoice();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/invoice/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/invoice');
      alert('Invoice deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar isPublic={false} />
          <div className="text-center py-20">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!invoice) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar isPublic={false} />
          <div className="text-center py-20">Invoice not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Invoice: {invoice.invoiceNumber}</h2>
              <div className="flex space-x-2">
                {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                  <Link
                    href={`/admin/invoice/${invoice._id}/edit`}
                    className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </Link>
                )}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-600"
                >
                  Print
                </button>
                <Link
                  href="/admin/invoice"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8 print:p-4">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">SOLIDEX MANUFACTURING COMPANY</h1>
                    <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    {invoice.dueDate && (
                      <p className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    )}
                    <span className={`mt-2 inline-block px-3 py-1 text-xs rounded ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <p className="text-gray-700">{invoice.partyName}</p>
                    {invoice.partyAddress && <p className="text-gray-600 text-sm">{invoice.partyAddress}</p>}
                    {invoice.partyContact && <p className="text-gray-600 text-sm">Contact: {invoice.partyContact}</p>}
                    {invoice.partyGSTIN && <p className="text-gray-600 text-sm">GSTIN: {invoice.partyGSTIN}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Terms:</h3>
                    <p className="text-gray-700">{invoice.paymentTerms || 'Net 30'}</p>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Tax %</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{item.product?.name || 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-2">{item.description || '-'}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{item.tax || 0}%</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto w-64">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Discount:</span>
                    <span>-₹{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>+₹{invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Shipping:</span>
                    <span>+₹{invoice.shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>₹{invoice.total.toFixed(2)}</span>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                  <p className="text-gray-700">{invoice.notes}</p>
                </div>
              )}

              <div className="mt-6 flex space-x-2 no-print">
                {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('Sent')}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Mark as Sent
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('Paid')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark as Paid
                    </button>
                  </>
                )}
                {invoice.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('Cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Cancel Invoice
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Invoice
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

