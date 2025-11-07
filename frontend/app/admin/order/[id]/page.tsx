'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Order not found');
      router.push('/admin/order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/order/${params.id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrder(params.id as string);
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/order/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/order');
      alert('Order deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting order');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-900 dark:text-white">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Order: {order.orderNumber}</h2>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/order/${order._id}/edit`}
                  className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <Link
                  href="/admin/order"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                  <p className="text-gray-900 dark:text-white">{order.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={`px-3 py-1 text-sm rounded ${
                    order.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    order.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    order.status === 'In Production' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Date</label>
                  <p className="text-gray-900 dark:text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <span className={`px-2 py-1 text-xs rounded ${
                    order.priority === 'Urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    order.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {order.priority}
                  </span>
                </div>
                {order.deliveryDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
                    <p className="text-gray-900 dark:text-white">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Amount</label>
                  <p className="text-gray-900 dark:text-white font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {order.customerAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Address</label>
                  <p className="text-gray-900 dark:text-white">{order.customerAddress}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Specifications</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {order.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {item.product?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{item.rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">₹{item.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.specifications || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {order.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                  <p className="text-gray-900 dark:text-white">{order.remarks}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('Confirmed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Confirm Order
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('In Production')}
                        className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Start Production
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('Ready for Inspection')}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        Ready for Inspection
                      </button>
                    </>
                  )}
                  {order.status === 'Approved' && (
                    <button
                      onClick={() => handleStatusUpdate('Dispatched')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark as Dispatched
                    </button>
                  )}
                  {order.status === 'Dispatched' && (
                    <button
                      onClick={() => handleStatusUpdate('Completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

