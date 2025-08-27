'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Save, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  category: string | null;
  isActive: boolean;
}

interface Business {
  id: string;
  subscriptionTier: string;
  services: Service[];
  _count: {
    services: number;
  };
}

interface ServicesManagerProps {
  business: Business;
}

interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  category: string;
}

const defaultFormData: ServiceFormData = {
  name: '',
  description: '',
  durationMinutes: 60,
  priceCents: 5000,
  category: '',
};

export default function ServicesManager({ business }: ServicesManagerProps) {
  const [services, setServices] = useState(business.services);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const canAddService = business.subscriptionTier !== 'FREE' || 
                       services.filter(s => s.isActive).length < 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const url = editingService 
        ? `/api/business/${business.id}/services/${editingService.id}`
        : `/api/business/${business.id}/services`;
      
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingService) {
          setServices(prev => prev.map(s => 
            s.id === editingService.id ? data.service : s
          ));
          setMessage('Service updated successfully');
        } else {
          setServices(prev => [...prev, data.service]);
          setMessage('Service added successfully');
        }
        
        resetForm();
      } else {
        setMessage(data.error || 'Failed to save service');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setMessage('Service deleted successfully');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete service');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/business/${business.id}/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          isActive: !service.isActive,
          priceCents: service.priceCents,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setServices(prev => prev.map(s => 
          s.id === service.id ? data.service : s
        ));
        setMessage(`Service ${!service.isActive ? 'activated' : 'deactivated'}`);
      } else {
        setMessage(data.error || 'Failed to update service');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      category: service.category || '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setShowAddForm(false);
    setFormData(defaultFormData);
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const activeServices = services.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Your Services ({activeServices.length}/
            {business.subscriptionTier === 'FREE' ? '8' : '∞'})
          </h2>
          {business.subscriptionTier === 'FREE' && (
            <p className="text-sm text-gray-600">
              {8 - activeServices.length} service slots remaining on Free plan
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          disabled={!canAddService}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </button>
      </div>

      {!canAddService && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You've reached the service limit for the Free plan. 
            <a href="/dashboard/settings/billing" className="font-medium underline ml-1">
              Upgrade to add unlimited services.
            </a>
          </p>
        </div>
      )}

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
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hair Cut, Facial, Massage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hair, Skincare, Body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  step="15"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="Describe what's included in this service..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
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

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600">
              Add your first service to start accepting bookings
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {services.map((service) => (
              <div key={service.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {service.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {service.category}
                        </span>
                      )}
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-600 mt-1">{service.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.durationMinutes} minutes
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${formatPrice(service.priceCents)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        service.isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEdit(service)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-red-400 hover:text-red-600"
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
