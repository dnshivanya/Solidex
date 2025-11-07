'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import Navbar from '../../../../../components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EditCustomerInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    order: '',
    customerName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    actualDate: '',
    inspectionType: 'Final',
    customerTeam: [{ name: '', designation: '', contact: '' }],
    items: [],
    overallStatus: 'Scheduled',
    customerRemarks: '',
    internalRemarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInspection(params.id as string);
    }
  }, [params.id]);

  const fetchInspection = async (id: string) => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/customer-inspection/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inspection = res.data;
      setFormData({
        order: inspection.order?._id || inspection.order || '',
        customerName: inspection.customerName || '',
        scheduledDate: new Date(inspection.scheduledDate).toISOString().split('T')[0],
        actualDate: inspection.actualDate ? new Date(inspection.actualDate).toISOString().split('T')[0] : '',
        inspectionType: inspection.inspectionType || 'Final',
        customerTeam: inspection.customerTeam || [{ name: '', designation: '', contact: '' }],
        items: inspection.items || [],
        overallStatus: inspection.overallStatus || 'Scheduled',
        customerRemarks: inspection.customerRemarks || '',
        internalRemarks: inspection.internalRemarks || ''
      });
    } catch (error) {
      console.error('Error fetching inspection:', error);
      alert('Inspection not found');
      router.push('/admin/customer-inspection');
    } finally {
      setFetching(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems: any[] = [...(formData.items as any[])];
    const currentItem = (newItems[index] || {}) as any;
    newItems[index] = { ...currentItem, [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleTeamChange = (index: number, field: string, value: string) => {
    const newTeam = [...formData.customerTeam];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, customerTeam: newTeam });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      customerTeam: [...formData.customerTeam, { name: '', designation: '', contact: '' }]
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      customerTeam: formData.customerTeam.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/customer-inspection/${params.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/admin/customer-inspection/${params.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating inspection');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Customer Inspection</h2>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inspection Type *</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  >
                    <option value="Pre-Production">Pre-Production</option>
                    <option value="In-Process">In-Process</option>
                    <option value="Final">Final</option>
                    <option value="Re-Inspection">Re-Inspection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actual Date</label>
                  <input
                    type="date"
                    value={formData.actualDate}
                    onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Status</label>
                <select
                  value={formData.overallStatus}
                  onChange={(e) => setFormData({ ...formData, overallStatus: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Conditional Approval">Conditional Approval</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Team</label>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="text-brand-blue dark:text-blue-400 hover:underline"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.customerTeam.map((member: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
                          <input
                            type="text"
                            value={member.designation}
                            onChange={(e) => handleTeamChange(index, 'designation', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</label>
                          <div className="flex">
                            <input
                              type="text"
                              value={member.contact}
                              onChange={(e) => handleTeamChange(index, 'contact', e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            />
                            {formData.customerTeam.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTeamMember(index)}
                                className="ml-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Inspection Items</label>
                  <div className="space-y-4">
                    {formData.items.map((item: any, index: number) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product</label>
                            <p className="text-gray-900">{item.product?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                            <p className="text-gray-900">{item.quantity}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inspected Qty</label>
                            <input
                              type="number"
                              value={item.inspectedQuantity}
                              onChange={(e) => handleItemChange(index, 'inspectedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                              min="0"
                              max={item.quantity}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passed Qty</label>
                            <input
                              type="number"
                              value={item.passedQuantity}
                              onChange={(e) => handleItemChange(index, 'passedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rejected Qty</label>
                            <input
                              type="number"
                              value={item.rejectedQuantity}
                              onChange={(e) => handleItemChange(index, 'rejectedQuantity', parseInt(e.target.value))}
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                              min="0"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Remarks</label>
                <textarea
                  value={formData.customerRemarks}
                  onChange={(e) => setFormData({ ...formData, customerRemarks: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Internal Remarks</label>
                <textarea
                  value={formData.internalRemarks}
                  onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href={`/admin/customer-inspection/${params.id}`}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Inspection'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

