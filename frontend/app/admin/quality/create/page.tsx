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
  unit: string;
}

interface DC {
  _id: string;
  dcNumber: string;
  type: string;
  items: any[];
}

export default function CreateQualityCheckPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [dcs, setDcs] = useState<DC[]>([]);
  const [formData, setFormData] = useState({
    type: 'Incoming',
    date: new Date().toISOString().split('T')[0],
    inspector: '',
    dcReference: '',
    remarks: '',
    items: [{ product: '', quantity: 1, checkedQuantity: 0, passedQuantity: 0, failedQuantity: 0, batchNumber: '', defects: [], inspectorNotes: '', status: 'Pending' }]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchDCs();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDCs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/dc`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDcs(res.data);
    } catch (error) {
      console.error('Error fetching DCs:', error);
    }
  };

  const handleDCSelect = (dcId: string) => {
    const dc = dcs.find(d => d._id === dcId);
    if (dc && dc.items) {
      const items = dc.items.map((item: any) => ({
        product: item.product._id || item.product,
        quantity: item.quantity,
        checkedQuantity: 0,
        passedQuantity: 0,
        failedQuantity: 0,
        batchNumber: '',
        defects: [],
        inspectorNotes: '',
        status: 'Pending'
      }));
      setFormData({ ...formData, dcReference: dcId, items });
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'checkedQuantity' || field === 'passedQuantity' || field === 'failedQuantity') {
      const checked = parseInt(String(newItems[index].checkedQuantity)) || 0;
      const passed = parseInt(String(newItems[index].passedQuantity)) || 0;
      const failed = parseInt(String(newItems[index].failedQuantity)) || 0;
      
      if (checked > 0) {
        if (passed === checked && failed === 0) newItems[index].status = 'Passed';
        else if (failed === checked && passed === 0) newItems[index].status = 'Failed';
        else if (passed + failed === checked) newItems[index].status = 'Partial';
        else newItems[index].status = 'In Progress';
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, checkedQuantity: 0, passedQuantity: 0, failedQuantity: 0, batchNumber: '', defects: [], inspectorNotes: '', status: 'Pending' }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/quality`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/quality');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating quality check');
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Create Quality Check</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Production">Production</option>
                    <option value="Rework">Rework</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inspector *</label>
                  <input
                    type="text"
                    value={formData.inspector}
                    onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DC Reference (Optional)</label>
                  <select
                    value={formData.dcReference}
                    onChange={(e) => handleDCSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select DC</option>
                    {dcs.map((dc) => (
                      <option key={dc._id} value={dc._id}>
                        {dc.dcNumber} - {dc.type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Items to Check *</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-brand-blue hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                          <select
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Checked Qty</label>
                          <input
                            type="number"
                            value={item.checkedQuantity}
                            onChange={(e) => handleItemChange(index, 'checkedQuantity', parseInt(e.target.value))}
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Failed Qty</label>
                          <input
                            type="number"
                            value={item.failedQuantity}
                            onChange={(e) => handleItemChange(index, 'failedQuantity', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <input
                            type="text"
                            value={item.status}
                            disabled
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
                        <textarea
                          value={item.inspectorNotes}
                          onChange={(e) => handleItemChange(index, 'inspectorNotes', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          rows={2}
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/quality"
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Quality Check'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

