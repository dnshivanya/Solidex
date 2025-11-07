'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  items: any[];
}

export default function CreateCustomerInspectionPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    order: '',
    customerName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    actualDate: '',
    inspectionType: 'Final',
    customerTeam: [{ name: '', designation: '', contact: '' }],
    items: [],
    overallStatus: 'Scheduled',
    customerRemarks: '',
    internalRemarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      const items = order.items.map((item: any) => ({
        order: orderId,
        product: item.product._id || item.product,
        quantity: item.quantity,
        inspectedQuantity: 0,
        passedQuantity: 0,
        rejectedQuantity: 0,
        remarks: ''
      }));
      setFormData({
        ...formData,
        order: orderId,
        customerName: order.customerName,
        items
      });
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleTeamChange = (index: number, field: string, value: string) => {
    const newTeam = [...formData.customerTeam];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, customerTeam: newTeam });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      customerTeam: [...formData.customerTeam, { name: '', designation: '', contact: '' }]
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      customerTeam: formData.customerTeam.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/customer-inspection`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/customer-inspection');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Schedule Customer Inspection</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order *</label>
                <select
                  value={formData.order}
                  onChange={(e) => handleOrderSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Order</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.orderNumber} - {order.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Type *</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="In-Process">In-Process</option>
                    <option value="Final">Final</option>
                    <option value="Re-Inspection">Re-Inspection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Date</label>
                  <input
                    type="date"
                    value={formData.actualDate}
                    onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Customer Team *</label>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="text-brand-blue hover:underline"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.customerTeam.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                          <input
                            type="text"
                            value={member.designation}
                            onChange={(e) => handleTeamChange(index, 'designation', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={member.contact}
                              onChange={(e) => handleTeamChange(index, 'contact', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            {formData.customerTeam.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="ml-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Items to Inspect</label>
                  <div className="space-y-4">
                    {formData.items.map((item: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                            <p className="text-gray-900">{item.product?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <p className="text-gray-900">{item.quantity}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inspected Qty</label>
                            <input
                              type="number"
                              value={item.inspectedQuantity}
                              onChange={(e) => handleItemChange(index, 'inspectedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              min="0"
                              max={item.quantity}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Passed Qty</label>
                            <input
                              type="number"
                              value={item.passedQuantity}
                              onChange={(e) => handleItemChange(index, 'passedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rejected Qty</label>
                            <input
                              type="number"
                              value={item.rejectedQuantity}
                              onChange={(e) => handleItemChange(index, 'rejectedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              min="0"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Remarks</label>
                <textarea
                  value={formData.customerRemarks}
                  onChange={(e) => setFormData({ ...formData, customerRemarks: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Remarks</label>
                <textarea
                  value={formData.internalRemarks}
                  onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/customer-inspection"
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Schedule Inspection'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

