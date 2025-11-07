'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Navbar from '../../../components/Navbar';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface StockItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  location: string;
  lastUpdated: string;
}

interface Product {
  _id: string;
  name: string;
  unit: string;
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    product: '',
    quantity: 0,
    location: 'Main Warehouse'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStock();
    fetchSummary();
    fetchProducts();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/stock`);
      setStock(res.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/stock/summary`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleOpenForm = (item?: StockItem) => {
    if (item) {
      setEditingStock(item);
      setFormData({
        product: item.product._id,
        quantity: item.quantity,
        location: item.location
      });
    } else {
      setEditingStock(null);
      setFormData({
        product: '',
        quantity: 0,
        location: 'Main Warehouse'
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStock(null);
    setFormData({
      product: '',
      quantity: 0,
      location: 'Main Warehouse'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (editingStock) {
        // Update existing stock
        await axios.put(`${API_URL}/stock/${editingStock._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new stock
        await axios.post(`${API_URL}/stock`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      handleCloseForm();
      fetchStock();
      fetchSummary();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error saving stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (stockId: string) => {
    if (!confirm('Are you sure you want to delete this stock entry? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/stock/${stockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStock();
      fetchSummary();
      alert('Stock entry deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting stock');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Stock Management</h2>
              <Button onClick={() => handleOpenForm()}>
                + Add Stock
              </Button>
            </div>

            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border-l-4 border-l-brand-blue">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Total Products</h3>
                      <p className="text-3xl font-bold text-gray-900">{summary.totalProducts}</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-brand-green">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Total Quantity</h3>
                      <p className="text-3xl font-bold text-gray-900">{summary.totalQuantity}</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </Card>
                <Card className="border-l-4 border-l-brand-yellow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Low Stock Items</h3>
                      <p className="text-3xl font-bold text-gray-900">{summary.lowStockCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-yellow/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
                <p className="mt-4 text-gray-600">Loading stock...</p>
              </div>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stock.map((item) => (
                        <tr 
                          key={item._id} 
                          className={`hover:bg-gray-50 transition-colors ${
                            item.quantity <= 10 ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {item.product?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${
                              item.quantity <= 10 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {item.quantity}
                            </span>
                            {item.quantity <= 10 && (
                              <Badge variant="danger" size="sm" className="ml-2">Low Stock</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product?.unit || 'PCS'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleOpenForm(item)}
                              className="text-brand-blue hover:text-blue-600 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stock.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No stock items found</p>
                      <Button onClick={() => handleOpenForm()} size="sm" className="mt-4">
                        Add First Stock Item
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Add/Edit Stock Modal */}
            <Modal
              isOpen={showForm}
              onClose={handleCloseForm}
              title={editingStock ? 'Edit Stock' : 'Add Stock'}
              size="md"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none"
                    required
                    disabled={!!editingStock}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity *"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <Input
                    label="Location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Main Warehouse"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    {editingStock ? 'Update Stock' : 'Add Stock'}
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

