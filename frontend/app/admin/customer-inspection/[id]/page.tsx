'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CustomerInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInspection(params.id as string);
    }
  }, [params.id]);

  const fetchInspection = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/customer-inspection/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInspection(res.data);
    } catch (error) {
      console.error('Error fetching inspection:', error);
      alert('Inspection not found');
      router.push('/admin/customer-inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this inspection? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/customer-inspection/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/customer-inspection');
      alert('Inspection deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting inspection');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-900 dark:text-white">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!inspection) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Inspection: {inspection.inspectionNumber}</h2>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/customer-inspection/${inspection._id}/edit`}
                  className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <Link
                  href="/admin/customer-inspection"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                  <p className="text-gray-900 dark:text-white">{inspection.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                  <p className="text-gray-900 dark:text-white">{inspection.order?.orderNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date</label>
                  <p className="text-gray-900 dark:text-white">{new Date(inspection.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspection Type</label>
                  <p className="text-gray-900 dark:text-white">{inspection.inspectionType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={`px-3 py-1 text-sm rounded ${
                    inspection.overallStatus === 'Passed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    inspection.overallStatus === 'Failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    inspection.overallStatus === 'Conditional Approval' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {inspection.overallStatus}
                  </span>
                </div>
              </div>

              {inspection.customerTeam && inspection.customerTeam.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Team</h3>
                  <div className="space-y-2">
                    {inspection.customerTeam.map((member: any, index: number) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                        <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{member.designation}</p>
                        {member.contact && <p className="text-sm text-gray-600 dark:text-gray-300">Contact: {member.contact}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inspection Items</h3>
                <div className="space-y-4">
                  {inspection.items.map((item: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                          <p className="text-gray-900 dark:text-white">{item.product?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                          <p className="text-gray-900 dark:text-white">{item.quantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspected</label>
                          <p className="text-gray-900 dark:text-white">{item.inspectedQuantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passed</label>
                          <p className="text-green-600 dark:text-green-400 font-semibold">{item.passedQuantity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rejected</label>
                          <p className="text-red-600 dark:text-red-400 font-semibold">{item.rejectedQuantity}</p>
                        </div>
                        {item.remarks && (
                          <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                            <p className="text-gray-900 dark:text-white">{item.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {inspection.customerRemarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Remarks</label>
                  <p className="text-gray-900 dark:text-white">{inspection.customerRemarks}</p>
                </div>
              )}

              {inspection.internalRemarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Remarks</label>
                  <p className="text-gray-900 dark:text-white">{inspection.internalRemarks}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Inspection
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

