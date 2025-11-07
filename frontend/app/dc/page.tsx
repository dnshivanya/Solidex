'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DC {
  _id: string;
  dcNumber: string;
  type: 'Inward' | 'Outward';
  date: string;
  partyName: string;
  status: string;
  items: any[];
}

export default function DCPage() {
  const [dcs, setDcs] = useState<DC[]>([]);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDCs();
  }, [filter]);

  const fetchDCs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      
      const res = await axios.get(`${API_URL}/dc?${params.toString()}`);
      setDcs(res.data);
    } catch (error) {
      console.error('Error fetching DCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (dcId: string) => {
    if (!confirm('Complete this DC and update stock?')) return;
    
    try {
      await axios.post(`${API_URL}/dc/${dcId}/complete`);
      fetchDCs();
      alert('DC completed successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error completing DC');
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
              <Link href="/dc" className="text-brand-blue font-medium">DC Management</Link>
              <Link href="/stock" className="text-gray-700 hover:text-brand-blue">Stock</Link>
              <Link href="/products" className="text-gray-700 hover:text-brand-blue">Products</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Delivery Challan Management</h2>
            <div className="flex space-x-4">
              <Link 
                href="/dc/create?type=Inward"
                className="bg-brand-green text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Inward DC
              </Link>
              <Link 
                href="/dc/create?type=Outward"
                className="bg-brand-yellow text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Create Outward DC
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="Inward">Inward</option>
                  <option value="Outward">Outward</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DC Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dcs.map((dc) => (
                    <tr key={dc._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dc.dcNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          dc.type === 'Inward' ? 'bg-brand-green text-white' : 'bg-brand-yellow text-white'
                        }`}>
                          {dc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dc.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dc.partyName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{dc.items.length} items</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          dc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          dc.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Link href={`/dc/${dc._id}`} className="text-brand-blue hover:underline">View</Link>
                        {dc.status === 'Draft' && (
                          <button
                            onClick={() => handleComplete(dc._id)}
                            className="text-brand-green hover:underline"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dcs.length === 0 && (
                <div className="text-center py-12 text-gray-500">No DCs found</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

