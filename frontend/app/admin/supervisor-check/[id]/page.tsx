'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SupervisorCheckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [check, setCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCheck(params.id as string);
    }
  }, [params.id]);

  const fetchCheck = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/supervisor-check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheck(res.data);
    } catch (error) {
      console.error('Error fetching supervisor check:', error);
      alert('Supervisor check not found');
      router.push('/admin/supervisor-check');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this supervisor check? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/supervisor-check/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/supervisor-check');
      alert('Supervisor check deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting supervisor check');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!check) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Supervisor Check: {check.checkNumber}</h2>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/supervisor-check/${check._id}/edit`}
                  className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <Link
                  href="/admin/supervisor-check"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <p className="text-gray-900">{check.product?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <p className="text-gray-900">{check.order?.orderNumber || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  <p className="text-gray-900">{check.supervisor}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Date</label>
                  <p className="text-gray-900">{new Date(check.checkDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Type</label>
                  <p className="text-gray-900">{check.checkType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 text-sm rounded ${
                    check.overallStatus === 'Passed' ? 'bg-green-100 text-green-800' :
                    check.overallStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                    check.overallStatus === 'Conditional Pass' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {check.overallStatus}
                  </span>
                </div>
                {check.batchNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <p className="text-gray-900">{check.batchNumber}</p>
                  </div>
                )}
              </div>

              {check.dimensions && check.dimensions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimension Checks</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specification</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Value</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tolerance</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {check.dimensions.map((dim: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{dim.parameter}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dim.specification}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{dim.actualValue || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{dim.tolerance || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded ${
                                dim.status === 'Pass' ? 'bg-green-100 text-green-800' :
                                dim.status === 'Fail' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {dim.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{dim.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visual Inspection</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded ${
                    check.visualInspection?.status === 'Pass' ? 'bg-green-100 text-green-800' :
                    check.visualInspection?.status === 'Fail' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {check.visualInspection?.status || 'Pending'}
                  </span>
                  {check.visualInspection?.remarks && (
                    <p className="text-sm text-gray-600 mt-2">{check.visualInspection.remarks}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Check</label>
                  <span className={`inline-block px-3 py-1 text-sm rounded ${
                    check.materialCheck?.status === 'Pass' ? 'bg-green-100 text-green-800' :
                    check.materialCheck?.status === 'Fail' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {check.materialCheck?.status || 'Pending'}
                  </span>
                  {check.materialCheck?.remarks && (
                    <p className="text-sm text-gray-600 mt-2">{check.materialCheck.remarks}</p>
                  )}
                </div>
              </div>

              {check.remarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <p className="text-gray-900">{check.remarks}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Check
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

