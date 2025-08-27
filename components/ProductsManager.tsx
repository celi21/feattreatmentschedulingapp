'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Package, DollarSign, Save, X, Upload, Eye } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  sku: string | null;
  isActive: boolean;
  isDigital: boolean;
  stockQuantity: number | null;
  imageUrl: string | null;
}

interface Business {
  id: string;
  subscriptionTier: string;
  products: Product[];
  _count: {
    products: number;
  };
}

interface ProductsManagerProps {
  business: Business;
}

interface ProductFormData {
  name: string;
  description: string;
  priceCents: number;
  sku: string;
  isDigital: boolean;
  stockQuantity: number | null;
  imageUrl: string;
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  priceCents: 2000,
  sku: '',
  isDigital: false,
  stockQuantity: null,
  imageUrl: '',
};

export default function ProductsManager({ business }: ProductsManagerProps) {
  const [products, setProducts] = useState(business.products);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let imageUrl = formData.imageUrl;

      // Handle image upload if a file is selected
      if (imageFile) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', imageFile);

        const uploadResponse = await fetch(`/api/business/${business.id}/upload`, {
          method: 'POST',
          body: formDataWithImage,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          setMessage('Failed to upload image');
          return;
        }
      }

      const url = editingProduct 
        ? `/api/business/${business.id}/products/${editingProduct.id}`
        : `/api/business/${business.id}/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingProduct) {
          setProducts(prev => prev.map(p => 
            p.id === editingProduct.id ? data.product : p
          ));
          setMessage('Product updated successfully');
        } else {
          setProducts(prev => [...prev, data.product]);
          setMessage('Product added successfully');
        }
        
        resetForm();
      } else {
        setMessage(data.error || 'Failed to save product');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setMessage('Product deleted successfully');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete product');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
          priceCents: product.priceCents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === product.id ? data.product : p
        ));
        setMessage(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
      } else {
        setMessage(data.error || 'Failed to update product');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      priceCents: product.priceCents,
      sku: product.sku || '',
      isDigital: product.isDigital,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
    });
    setPreviewUrl(product.imageUrl || '');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData(defaultFormData);
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const activeProducts = products.filter(p => p.isActive);

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Your Products ({activeProducts.length})
          </h2>
          <p className="text-sm text-gray-600">
            Add physical or digital products to your storefront
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-lg object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a high-quality image. Recommended: 800x800px, max 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hair Serum, Gift Card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional product code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.priceCents / 100}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priceCents: Math.round(parseFloat(e.target.value) * 100)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    stockQuantity: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for unlimited"
                  disabled={formData.isDigital}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your product..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDigital"
                checked={formData.isDigital}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isDigital: e.target.checked,
                  stockQuantity: e.target.checked ? null : prev.stockQuantity
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDigital" className="ml-2 block text-sm text-gray-700">
                This is a digital product (download or online service)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600">
              Add your first product to start selling
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-square">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex space-x-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.isDigital && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Digital
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        ${formatPrice(product.priceCents)}
                      </span>
                      {product.stockQuantity !== null && (
                        <p className="text-xs text-gray-500">
                          {product.stockQuantity > 0 
                            ? `${product.stockQuantity} in stock`
                            : 'Out of stock'
                          }
                        </p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`flex-1 px-3 py-1 rounded-md text-sm font-medium ${
                        product.isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-400 hover:text-red-600 border border-gray-300 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
