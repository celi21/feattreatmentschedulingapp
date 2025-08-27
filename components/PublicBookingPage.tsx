'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Globe, ShoppingBag } from 'lucide-react';
import BookingWidget from './BookingWidget';
import ProductCatalog from './ProductCatalog';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  category: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  isDigital: boolean;
  stockQuantity: number | null;
}

interface Provider {
  id: string;
  name: string;
  bio: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  logoUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  timezone: string;
  services: Service[];
  products: Product[];
  providers: Provider[];
}

interface PublicBookingPageProps {
  business: Business;
}

export default function PublicBookingPage({ business }: PublicBookingPageProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');

  const formatAddress = () => {
    const parts = [business.address, business.city, business.state].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: business.backgroundColor }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: business.primaryColor }}
              >
                {business.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
              {business.description && (
                <p className="text-gray-600 mt-1">{business.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {formatAddress() && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatAddress()}
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {business.phone}
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Book Services ({business.services.length})
            </button>
            {business.products.length > 0 && (
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag className="inline h-4 w-4 mr-2" />
                Shop Products ({business.products.length})
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'services' ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h2>
              <p className="text-gray-600">Choose a service and find the perfect time that works for you</p>
            </div>
            
            {business.services.length > 0 ? (
              <BookingWidget 
                business={business} 
                services={business.services} 
                providers={business.providers}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Services Available</h3>
                <p className="text-gray-600">
                  {business.name} hasn't added any services yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Products</h2>
              <p className="text-gray-600">Browse our curated selection of products</p>
            </div>
            
            <ProductCatalog business={business} products={business.products} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">Powered by FeatTreatment</p>
            <p className="text-sm">Professional scheduling and storefront platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
