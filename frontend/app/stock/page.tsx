'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

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

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
    fetchSummary();
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

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/stock/summary`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-brand-blue">SOLIDEX</Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-brand-blue">Dashboard</Link>
              <Link href="/dc" className="text-gray-700 hover:text-brand-blue">DC Management</Link>
              <Link href="/stock" className="text-brand-blue font-medium">Stock</Link>
              <Link href="/products" className="text-gray-700 hover:text-brand-blue">Products</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Stock Management</h2>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-brand-blue">
                <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalProducts}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-brand-green">
                <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalQuantity}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-brand-yellow">
                <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.lowStockCount}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stock.map((item) => (
                    <tr key={item._id} className={item.quantity <= 10 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.product?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          item.quantity <= 10 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.product?.unit || 'PCS'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stock.length === 0 && (
                <div className="text-center py-12 text-gray-500">No stock items found</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

