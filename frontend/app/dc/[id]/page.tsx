'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DCItem {
  product: {
    _id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  unit: string;
  description: string;
}

interface DC {
  _id: string;
  dcNumber: string;
  type: 'Inward' | 'Outward';
  date: string;
  partyName: string;
  partyAddress: string;
  partyContact: string;
  vehicleNumber: string;
  driverName: string;
  driverContact: string;
  remarks: string;
  status: string;
  items: DCItem[];
}

export default function DCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dc, setDc] = useState<DC | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDC(params.id as string);
    }
  }, [params.id]);

  const fetchDC = async (id: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/dc/${id}`);
      setDc(res.data);
    } catch (error) {
      console.error('Error fetching DC:', error);
      alert('DC not found');
      router.push('/dc');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('Complete this DC and update stock?')) return;
    
    try {
      await axios.post(`${API_URL}/dc/${dc?._id}/complete`);
      fetchDC(dc!._id);
      alert('DC completed successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error completing DC');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!dc) {
    return null;
  }

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

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">DC Details</h2>
            <Link
              href="/dc"
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Back to List
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">DC Number</label>
                <p className="text-lg font-semibold text-gray-900">{dc.dcNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 text-sm rounded ${
                  dc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  dc.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {dc.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                <span className={`inline-block px-3 py-1 text-sm rounded ${
                  dc.type === 'Inward' ? 'bg-brand-green text-white' : 'bg-brand-yellow text-white'
                }`}>
                  {dc.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                <p className="text-gray-900">{new Date(dc.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Party Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Party Name</label>
                  <p className="text-gray-900">{dc.partyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                  <p className="text-gray-900">{dc.partyContact || '-'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-gray-900">{dc.partyAddress || '-'}</p>
                </div>
              </div>
            </div>

            {(dc.vehicleNumber || dc.driverName) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Number</label>
                    <p className="text-gray-900">{dc.vehicleNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                    <p className="text-gray-900">{dc.driverName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Driver Contact</label>
                    <p className="text-gray-900">{dc.driverContact || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dc.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.product?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.unit || 'PCS'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {dc.remarks && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-500 mb-1">Remarks</label>
                <p className="text-gray-900">{dc.remarks}</p>
              </div>
            )}

            {dc.status === 'Draft' && (
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={handleComplete}
                  className={`px-6 py-2 rounded text-white ${
                    dc.type === 'Inward' 
                      ? 'bg-brand-green hover:bg-green-600' 
                      : 'bg-brand-yellow hover:bg-yellow-600'
                  }`}
                >
                  Complete DC
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

