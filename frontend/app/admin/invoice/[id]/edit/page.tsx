'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import Navbar from '../../../../../components/Navbar';

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

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [dcs, setDcs] = useState<DC[]>([]);
  const [formData, setFormData] = useState({
    type: 'Sales',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    partyName: '',
    partyAddress: '',
    partyContact: '',
    partyGSTIN: '',
    dcReference: '',
    paymentTerms: 'Net 30',
    notes: '',
    discount: 0,
    tax: 0,
    shipping: 0,
    items: [{ product: '', description: '', quantity: 1, unit: 'PCS', rate: 0, discount: 0, tax: 0, amount: 0 }]
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchDCs();
    if (params.id) {
      fetchInvoice(params.id as string);
    }
  }, [params.id]);

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

  const fetchInvoice = async (id: string) => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoice/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const invoice = res.data;
      setFormData({
        type: invoice.type,
        date: new Date(invoice.date).toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        partyName: invoice.partyName || '',
        partyAddress: invoice.partyAddress || '',
        partyContact: invoice.partyContact || '',
        partyGSTIN: invoice.partyGSTIN || '',
        dcReference: invoice.dcReference?._id || invoice.dcReference || '',
        paymentTerms: invoice.paymentTerms || 'Net 30',
        notes: invoice.notes || '',
        discount: invoice.discount || 0,
        tax: invoice.tax || 0,
        shipping: invoice.shipping || 0,
        items: invoice.items.map((item: any) => ({
          product: item.product._id || item.product,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit || 'PCS',
          rate: item.rate || 0,
          discount: item.discount || 0,
          tax: item.tax || 0,
          amount: item.amount || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Invoice not found');
      router.push('/admin/invoice');
    } finally {
      setFetching(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'rate' || field === 'quantity' || field === 'discount' || field === 'tax') {
      const rate = parseFloat(String(newItems[index].rate)) || 0;
      const qty = parseFloat(String(newItems[index].quantity)) || 0;
      const discount = parseFloat(String(newItems[index].discount)) || 0;
      const tax = parseFloat(String(newItems[index].tax)) || 0;
      const itemAmount = (rate * qty) - discount;
      newItems[index].amount = itemAmount + (itemAmount * tax / 100);
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', description: '', quantity: 1, unit: 'PCS', rate: 0, discount: 0, tax: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const total = subtotal - (formData.discount || 0) + (formData.tax || 0) + (formData.shipping || 0);
    return { subtotal, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { subtotal, total } = calculateTotal();
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/invoice/${params.id}`, {
        ...formData,
        subtotal,
        total
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/admin/invoice/${params.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total } = calculateTotal();

  if (fetching) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">Loading...</div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Invoice</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Service">Service</option>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DC Reference (Optional)</label>
                <select
                  value={formData.dcReference}
                  onChange={(e) => setFormData({ ...formData, dcReference: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Party GSTIN</label>
                  <input
                    type="text"
                    value={formData.partyGSTIN}
                    onChange={(e) => setFormData({ ...formData, partyGSTIN: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
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
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
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
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            min="1"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tax %</label>
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            value={item.amount.toFixed(2)}
                            disabled
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                          />
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
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="mt-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping</label>
                  <input
                    type="number"
                    value={formData.shipping}
                    onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Discount:</span>
                  <span>-₹{formData.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax:</span>
                  <span>+₹{formData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>+₹{formData.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href={`/admin/invoice/${params.id}`}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded text-white bg-brand-green hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Invoice'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

