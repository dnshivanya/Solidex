'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface GalleryItem {
  _id: string;
  title: string;
  image: string;
  description: string;
  order: number;
}

export default function GalleryPage() {
  const { user } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null
  });
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/gallery`);
      setGalleryItems(res.data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please select an image');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('image', formData.image);
      uploadFormData.append('title', formData.title || 'Untitled');
      uploadFormData.append('description', formData.description);

      await axios.post(`${API_URL}/gallery`, uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Image uploaded successfully!');
      setIsUploadModalOpen(false);
      setFormData({ title: '', description: '', image: null });
      setPreview('');
      fetchGalleryItems();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image: null
    });
    setPreview(item.image.startsWith('http') ? item.image : `${API_URL.replace('/api', '')}${item.image}`);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const updateFormData = new FormData();
      if (formData.image) {
        updateFormData.append('image', formData.image);
      }
      updateFormData.append('title', formData.title);
      updateFormData.append('description', formData.description);

      await axios.put(`${API_URL}/gallery/${editingItem._id}`, updateFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Gallery item updated successfully!');
      setIsEditModalOpen(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', image: null });
      setPreview('');
      fetchGalleryItems();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating gallery item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Gallery item deleted successfully!');
      fetchGalleryItems();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error deleting gallery item');
    }
  };

  const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${API_URL.replace('/api', '')}${image}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isPublic={true} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Our Gallery</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Showcasing our manufacturing facility and products
                </p>
              </div>
              {user ? (
                <button
                  onClick={() => {
                    setFormData({ title: '', description: '', image: null });
                    setPreview('');
                    setIsUploadModalOpen(true);
                  }}
                  className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  + Upload Image
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg inline-block"
                >
                  Login to Upload
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No gallery items yet. {user && 'Upload your first image!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div 
                  key={item._id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition relative group"
                >
                  <div className="h-64 bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center relative">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="text-white text-2xl font-bold">${item.title}</div>`;
                        }
                      }}
                    />
                    {user && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Gallery Image"
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 w-full h-48 object-cover rounded" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter image title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              placeholder="Enter image description (optional)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        title="Edit Gallery Image"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Image
            </label>
            {preview && (
              <img src={preview} alt="Current" className="w-full h-48 object-cover rounded" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
