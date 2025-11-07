'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Navbar from '../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DrawingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [drawing, setDrawing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDrawing(params.id as string);
    }
  }, [params.id]);

  const fetchDrawing = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/drawing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrawing(res.data);
    } catch (error) {
      console.error('Error fetching drawing:', error);
      alert('Drawing not found');
      router.push('/admin/drawing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this drawing? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/drawing/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push('/admin/drawing');
      alert('Drawing deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting drawing');
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

  if (!drawing) return null;

  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${drawing.drawingFile}`;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Drawing: {drawing.drawingNumber}</h2>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/drawing/${drawing._id}/edit`}
                  className="px-4 py-2 bg-brand-yellow text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <Link
                  href="/admin/drawing"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <p className="text-gray-900 dark:text-white">{drawing.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                  <p className="text-gray-900 dark:text-white">{drawing.product?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
                  <p className="text-gray-900 dark:text-white">{drawing.order?.orderNumber || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <span className={`px-3 py-1 text-sm rounded ${
                    drawing.status === 'Approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    drawing.status === 'Rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    drawing.status === 'Pending Approval' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {drawing.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                  <p className="text-gray-900 dark:text-white">{drawing.version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Type</label>
                  <p className="text-gray-900 dark:text-white">{drawing.fileType}</p>
                </div>
              </div>

              {drawing.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <p className="text-gray-900 dark:text-white">{drawing.description}</p>
                </div>
              )}

              {drawing.specifications && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {drawing.specifications.dimensions?.length && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Length</label>
                        <p className="text-gray-900 dark:text-white">{drawing.specifications.dimensions.length} mm</p>
                      </div>
                    )}
                    {drawing.specifications.dimensions?.width && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width</label>
                        <p className="text-gray-900 dark:text-white">{drawing.specifications.dimensions.width} mm</p>
                      </div>
                    )}
                    {drawing.specifications.dimensions?.outerDiameter && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outer Diameter (OD)</label>
                        <p className="text-gray-900 dark:text-white">{drawing.specifications.dimensions.outerDiameter} mm</p>
                      </div>
                    )}
                    {drawing.specifications.material && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
                        <p className="text-gray-900 dark:text-white">{drawing.specifications.material}</p>
                      </div>
                    )}
                    {drawing.specifications.weight && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                        <p className="text-gray-900 dark:text-white">{drawing.specifications.weight} kg</p>
                      </div>
                    )}
                  </div>
                  {drawing.specifications.dimensions?.customFields && drawing.specifications.dimensions.customFields.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Custom Dimension Fields</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {drawing.specifications.dimensions.customFields.map((field: any, index: number) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.name}</label>
                            <p className="text-gray-900 dark:text-white">{field.value} {field.unit || 'mm'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drawing File</label>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  <span className="mr-2">📄</span>
                  View/Download Drawing
                </a>
              </div>

              {drawing.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <p className="text-gray-900 dark:text-white">{drawing.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Drawing
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

