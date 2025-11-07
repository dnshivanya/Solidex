'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

function CreateDCPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get('type') || 'Inward';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    type: type,
    date: new Date().toISOString().split('T')[0],
    partyName: '',
    partyAddress: '',
    partyContact: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    remarks: '',
    items: [{ product: '', quantity: 1, unit: 'PCS', description: '' }]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].unit = product.unit;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unit: 'PCS', description: '' }]
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
      await axios.post(`${API_URL}/dc`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/dc');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating DC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Create {type} Delivery Challan
            </h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    disabled
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Name *</label>
                <input
                  type="text"
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Address</label>
                <textarea
                  value={formData.partyAddress}
                  onChange={(e) => setFormData({ ...formData, partyAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Party Contact</label>
                  <input
                    type="text"
                    value={formData.partyContact}
                    onChange={(e) => setFormData({ ...formData, partyContact: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Contact</label>
                  <input
                    type="text"
                    value={formData.driverContact}
                    onChange={(e) => setFormData({ ...formData, driverContact: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Items * (Drag to reorder)</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-brand-blue hover:underline"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-4" id="items-container">
                  {formData.items.map((item, index) => (
                    <div 
                      key={index} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderTop = '3px solid #3b82f6';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderTop = '';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderTop = '';
                        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const newItems = [...formData.items];
                        const draggedItem = newItems[draggedIndex];
                        newItems.splice(draggedIndex, 1);
                        newItems.splice(index, 0, draggedItem);
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="border border-gray-200 rounded p-4 cursor-move hover:border-brand-blue hover:shadow-md transition-all bg-white"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-gray-400 mr-2">☰</span>
                        <span className="text-xs text-gray-500">Item {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
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
                        <div className="col-span-2">
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
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
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
                  href="/admin/dc"
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded text-white ${
                    type === 'Inward' 
                      ? 'bg-brand-green hover:bg-green-600' 
                      : 'bg-brand-yellow hover:bg-yellow-600'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Creating...' : 'Create DC'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function CreateDCPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </ProtectedRoute>
    }>
      <CreateDCPageContent />
    </Suspense>
  );
}

