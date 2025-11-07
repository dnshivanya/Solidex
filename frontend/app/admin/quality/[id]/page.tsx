'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function QualityCheckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [qc, setQc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQC();
  }, [params.id]);

  const fetchQC = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/quality/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQc(res.data);
    } catch (error) {
      console.error('Error fetching quality check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quality check? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/quality/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/quality');
      alert('Quality check deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting quality check');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar isPublic={false} />
          <div className="text-center py-20">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!qc) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar isPublic={false} />
          <div className="text-center py-20">Quality check not found</div>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Quality Check: {qc.qcNumber}</h2>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/quality/${qc._id}/edit`}
                  className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <Link
                  href="/admin/quality"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back to List
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{qc.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{new Date(qc.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inspector</label>
                  <p className="text-gray-900">{qc.inspector}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Status</label>
                  <span className={`px-3 py-1 text-sm rounded ${
                    qc.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' :
                    qc.overallStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                    qc.overallStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    qc.overallStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {qc.overallStatus}
                  </span>
                </div>
                {qc.dcReference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DC Reference</label>
                    <p className="text-gray-900">{qc.dcReference.dcNumber}</p>
                  </div>
                )}
              </div>

              {qc.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <p className="text-gray-900">{qc.remarks}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Checked</h3>
                <div className="space-y-4">
                  {qc.items.map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-4 gap-4 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                          <p className="text-gray-900">{item.product?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <p className="text-gray-900">{item.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                          <p className="text-gray-900">{item.batchNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.status === 'Passed' ? 'bg-green-100 text-green-800' :
                            item.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            item.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Checked</label>
                          <p className="text-gray-900">{item.checkedQuantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Passed</label>
                          <p className="text-green-600 font-semibold">{item.passedQuantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Failed</label>
                          <p className="text-red-600 font-semibold">{item.failedQuantity}</p>
                        </div>
                      </div>
                      {item.inspectorNotes && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Notes</label>
                          <p className="text-gray-900">{item.inspectorNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Quality Check
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

