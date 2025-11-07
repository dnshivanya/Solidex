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
}

interface Order {
  _id: string;
  orderNumber: string;
}

export default function EditDrawingPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    order: '',
    product: '',
    title: '',
    description: '',
    version: '1.0',
    revision: '',
    drawingFile: '',
    fileType: 'PDF',
    uploadedBy: 'Admin',
    status: 'Draft',
    specifications: {
      dimensions: {
        length: '',
        width: '',
        height: '',
        outerDiameter: '',
        innerDiameter: '',
        thickness: '',
        customFields: []
      },
      material: '',
      weight: '',
      other: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    if (params.id) {
      fetchDrawing(params.id as string);
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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDrawing = async (id: string) => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/drawing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const drawing = res.data;
      setFormData({
        order: drawing.order?._id || drawing.order || '',
        product: drawing.product?._id || drawing.product || '',
        title: drawing.title || '',
        description: drawing.description || '',
        version: drawing.version || '1.0',
        revision: drawing.revision || '',
        drawingFile: drawing.drawingFile || '',
        fileType: drawing.fileType || 'PDF',
        uploadedBy: drawing.uploadedBy || 'Admin',
        status: drawing.status || 'Draft',
        specifications: {
          dimensions: {
            length: drawing.specifications?.dimensions?.length?.toString() || '',
            width: drawing.specifications?.dimensions?.width?.toString() || '',
            height: drawing.specifications?.dimensions?.height?.toString() || '',
            outerDiameter: drawing.specifications?.dimensions?.outerDiameter?.toString() || '',
            innerDiameter: drawing.specifications?.dimensions?.innerDiameter?.toString() || '',
            thickness: drawing.specifications?.dimensions?.thickness?.toString() || '',
            customFields: drawing.specifications?.dimensions?.customFields || []
          },
          material: drawing.specifications?.material || '',
          weight: drawing.specifications?.weight?.toString() || '',
          other: drawing.specifications?.other || ''
        },
        notes: drawing.notes || ''
      });
    } catch (error) {
      console.error('Error fetching drawing:', error);
      alert('Drawing not found');
      router.push('/admin/drawing');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size should be less than 20MB');
        return;
      }
      setSelectedFile(file);
      let ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      // Convert JPEG to JPG to match enum
      if (ext === 'JPEG') {
        ext = 'JPG';
      }
      // If not in enum, set to Other
      const validTypes = ['PDF', 'DWG', 'DXF', 'PNG', 'JPG'];
      if (!validTypes.includes(ext)) {
        ext = 'Other';
      }
      setFormData({ ...formData, fileType: ext });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      let fileUrl = formData.drawingFile;

      if (selectedFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('drawing', selectedFile);
        
        const uploadRes = await axios.post(`${API_URL}/upload/drawing`, uploadFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        fileUrl = uploadRes.data.fileUrl;
        setUploading(false);
      }

      // Ensure uploadedBy is set
      const uploadedBy = formData.uploadedBy || 'Admin';

      const drawingData = {
        ...formData,
        uploadedBy: uploadedBy,
        drawingFile: fileUrl,
        specifications: {
          ...formData.specifications,
          dimensions: {
            length: formData.specifications.dimensions.length ? parseFloat(formData.specifications.dimensions.length) : undefined,
            width: formData.specifications.dimensions.width ? parseFloat(formData.specifications.dimensions.width) : undefined,
            height: formData.specifications.dimensions.height ? parseFloat(formData.specifications.dimensions.height) : undefined,
            outerDiameter: formData.specifications.dimensions.outerDiameter ? parseFloat(formData.specifications.dimensions.outerDiameter) : undefined,
            innerDiameter: formData.specifications.dimensions.innerDiameter ? parseFloat(formData.specifications.dimensions.innerDiameter) : undefined,
            thickness: formData.specifications.dimensions.thickness ? parseFloat(formData.specifications.dimensions.thickness) : undefined,
            customFields: formData.specifications.dimensions.customFields.filter(f => f.name && f.value)
          },
          weight: formData.specifications.weight ? parseFloat(formData.specifications.weight) : undefined
        }
      };

      await axios.put(`${API_URL}/drawing/${params.id}`, drawingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/admin/drawing/${params.id}`);
    } catch (error: any) {
      setUploading(false);
      alert(error.response?.data?.error || 'Error updating drawing');
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
      <div className="min-h-screen bg-gray-50">
        <Navbar isPublic={false} />

        <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Edit Drawing</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order (Optional)</label>
                  <select
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Order</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.orderNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revision</label>
                  <input
                    type="text"
                    value={formData.revision}
                    onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Superseded">Superseded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drawing File {formData.drawingFile ? '(Current file exists, upload new to replace)' : '*'}</label>
                <input
                  type="file"
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-600 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">Accepted formats: PDF, DWG, DXF, PNG, JPG. Max size: 20MB</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (mm)</label>
                    <input
                      type="number"
                      value={formData.specifications.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: { ...formData.specifications.dimensions, length: e.target.value }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (mm)</label>
                    <input
                      type="number"
                      value={formData.specifications.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: { ...formData.specifications.dimensions, width: e.target.value }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Outer Diameter (OD) (mm)</label>
                    <input
                      type="number"
                      value={formData.specifications.dimensions.outerDiameter}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: { ...formData.specifications.dimensions, outerDiameter: e.target.value }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inner Diameter (ID) (mm)</label>
                    <input
                      type="number"
                      value={formData.specifications.dimensions.innerDiameter}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: { ...formData.specifications.dimensions, innerDiameter: e.target.value }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thickness (mm)</label>
                    <input
                      type="number"
                      value={formData.specifications.dimensions.thickness}
                      onChange={(e) => setFormData({
                        ...formData,
                        specifications: {
                          ...formData.specifications,
                          dimensions: { ...formData.specifications.dimensions, thickness: e.target.value }
                        }
                      })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-900">Custom Dimension Fields</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          specifications: {
                            ...formData.specifications,
                            dimensions: {
                              ...formData.specifications.dimensions,
                              customFields: [
                                ...formData.specifications.dimensions.customFields,
                                { name: '', value: '', unit: 'mm' }
                              ]
                            }
                          }
                        });
                      }}
                      className="text-brand-blue hover:underline text-sm"
                    >
                      + Add Custom Field
                    </button>
                  </div>
                  {formData.specifications.dimensions.customFields.length > 0 && (
                    <div className="space-y-3">
                      {formData.specifications.dimensions.customFields.map((field, index) => (
                        <div key={index} className="border border-gray-200 rounded p-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Field Name *</label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => {
                                  const newCustomFields = [...formData.specifications.dimensions.customFields];
                                  newCustomFields[index] = { ...newCustomFields[index], name: e.target.value };
                                  setFormData({
                                    ...formData,
                                    specifications: {
                                      ...formData.specifications,
                                      dimensions: {
                                        ...formData.specifications.dimensions,
                                        customFields: newCustomFields
                                      }
                                    }
                                  });
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="e.g., Depth, Radius"
                              />
                            </div>
                            <div className="col-span-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const newCustomFields = [...formData.specifications.dimensions.customFields];
                                  newCustomFields[index] = { ...newCustomFields[index], value: e.target.value };
                                  setFormData({
                                    ...formData,
                                    specifications: {
                                      ...formData.specifications,
                                      dimensions: {
                                        ...formData.specifications.dimensions,
                                        customFields: newCustomFields
                                      }
                                    }
                                  });
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Enter value"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                              <input
                                type="text"
                                value={field.unit}
                                onChange={(e) => {
                                  const newCustomFields = [...formData.specifications.dimensions.customFields];
                                  newCustomFields[index] = { ...newCustomFields[index], unit: e.target.value };
                                  setFormData({
                                    ...formData,
                                    specifications: {
                                      ...formData.specifications,
                                      dimensions: {
                                        ...formData.specifications.dimensions,
                                        customFields: newCustomFields
                                      }
                                    }
                                  });
                                }}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="mm"
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newCustomFields = formData.specifications.dimensions.customFields.filter((_, i) => i !== index);
                                setFormData({
                                  ...formData,
                                  specifications: {
                                    ...formData.specifications,
                                    dimensions: {
                                      ...formData.specifications.dimensions,
                                      customFields: newCustomFields
                                    }
                                  }
                                });
                              }}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <input
                    type="text"
                    value={formData.specifications.material}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, material: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.specifications.weight}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, weight: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Other Specifications</label>
                <textarea
                  value={formData.specifications.other}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, other: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
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
                  href={`/admin/drawing/${params.id}`}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-6 py-2 rounded text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : loading ? 'Updating...' : 'Update Drawing'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

