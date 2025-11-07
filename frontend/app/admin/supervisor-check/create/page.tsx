'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
}

interface Order {
  _id: string;
  orderNumber: string;
}

interface Drawing {
  _id: string;
  drawingNumber: string;
  title: string;
}

export default function CreateSupervisorCheckPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [formData, setFormData] = useState({
    order: '',
    drawing: '',
    product: '',
    batchNumber: '',
    supervisor: '',
    checkDate: new Date().toISOString().split('T')[0],
    checkType: 'In-Process',
    dimensions: [{ parameter: '', specification: '', actualValue: '', tolerance: '', status: 'Pending', remarks: '' }],
    visualInspection: { status: 'Pending', remarks: '' },
    materialCheck: { status: 'Pending', remarks: '' },
    overallStatus: 'Pending',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchDrawings();
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setFormData({ ...formData, supervisor: userData.name || 'Admin' });
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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

  const fetchDrawings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/drawing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrawings(res.data);
    } catch (error) {
      console.error('Error fetching drawings:', error);
    }
  };

  const handleDimensionChange = (index: number, field: string, value: any) => {
    const newDimensions = [...formData.dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    setFormData({ ...formData, dimensions: newDimensions });
  };

  const addDimension = () => {
    setFormData({
      ...formData,
      dimensions: [...formData.dimensions, { parameter: '', specification: '', actualValue: '', tolerance: '', status: 'Pending', remarks: '' }]
    });
  };

  const removeDimension = (index: number) => {
    setFormData({
      ...formData,
      dimensions: formData.dimensions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/supervisor-check`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/supervisor-check');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating supervisor check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Supervisor Check</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order (Optional)</label>
                  <select
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  >
                    <option value="">Select Order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.orderNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drawing (Optional)</label>
                  <select
                    value={formData.drawing}
                    onChange={(e) => setFormData({ ...formData, drawing: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  >
                    <option value="">Select Drawing</option>
                    {drawings.map((drawing) => (
                      <option key={drawing._id} value={drawing._id}>
                        {drawing.drawingNumber} - {drawing.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supervisor *</label>
                  <input
                    type="text"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Check Date *</label>
                  <input
                    type="date"
                    value={formData.checkDate}
                    onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Check Type *</label>
                  <select
                    value={formData.checkType}
                    onChange={(e) => setFormData({ ...formData, checkType: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="In-Process">In-Process</option>
                    <option value="Final">Final</option>
                    <option value="Random">Random</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dimension Checks *</label>
                  <button
                    type="button"
                    onClick={addDimension}
                    className="text-brand-blue dark:text-blue-400 hover:underline"
                  >
                    + Add Dimension
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.dimensions.map((dim, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                      <div className="grid grid-cols-6 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parameter *</label>
                          <input
                            type="text"
                            value={dim.parameter}
                            onChange={(e) => handleDimensionChange(index, 'parameter', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            placeholder="e.g., OD, ID, Length"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specification *</label>
                          <input
                            type="text"
                            value={dim.specification}
                            onChange={(e) => handleDimensionChange(index, 'specification', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            placeholder="Required value"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Value</label>
                          <input
                            type="number"
                            value={dim.actualValue}
                            onChange={(e) => handleDimensionChange(index, 'actualValue', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tolerance</label>
                          <input
                            type="text"
                            value={dim.tolerance}
                            onChange={(e) => handleDimensionChange(index, 'tolerance', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            placeholder="±0.5mm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                          <select
                            value={dim.status}
                            onChange={(e) => handleDimensionChange(index, 'status', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">&nbsp;</label>
                          {formData.dimensions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDimension(index)}
                              className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                        <input
                          type="text"
                          value={dim.remarks}
                          onChange={(e) => handleDimensionChange(index, 'remarks', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visual Inspection</label>
                  <select
                    value={formData.visualInspection.status}
                    onChange={(e) => setFormData({
                      ...formData,
                      visualInspection: { ...formData.visualInspection, status: e.target.value }
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 mb-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                  <textarea
                    value={formData.visualInspection.remarks}
                    onChange={(e) => setFormData({
                      ...formData,
                      visualInspection: { ...formData.visualInspection, remarks: e.target.value }
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    rows={2}
                    placeholder="Visual inspection remarks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Material Check</label>
                  <select
                    value={formData.materialCheck.status}
                    onChange={(e) => setFormData({
                      ...formData,
                      materialCheck: { ...formData.materialCheck, status: e.target.value }
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 mb-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                  <textarea
                    value={formData.materialCheck.remarks}
                    onChange={(e) => setFormData({
                      ...formData,
                      materialCheck: { ...formData.materialCheck, remarks: e.target.value }
                    })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    rows={2}
                    placeholder="Material check remarks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/supervisor-check"
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Check'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

