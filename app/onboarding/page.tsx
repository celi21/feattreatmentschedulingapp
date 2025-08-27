'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface BusinessSetup {
  description: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
  primaryColor: string;
  timezone: string;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessSlug = searchParams.get('businessSlug');

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [businessSetup, setBusinessSetup] = useState<BusinessSetup>({
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    primaryColor: '#3B82F6',
    timezone: 'America/New_York',
  });

  const [services, setServices] = useState([
    { name: '', durationMinutes: 60, priceCents: 5000, description: '' }
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleBusinessUpdate = (field: keyof BusinessSetup, value: string) => {
    setBusinessSetup(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setServices(prev => [...prev, { name: '', durationMinutes: 60, priceCents: 5000, description: '' }]);
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: string, value: string | number) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update business information
      await fetch('/api/business/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessSlug,
          ...businessSetup,
          services: services.filter(s => s.name.trim() !== '')
        }),
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Business Details', completed: currentStep > 1 },
    { number: 2, title: 'Services & Pricing', completed: currentStep > 2 },
    { number: 3, title: 'Customization', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step.completed ? 'bg-green-500 text-white' : 
                  currentStep === step.number ? 'bg-blue-600 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step.completed ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div className="ml-3">
                  <div className={`font-medium ${currentStep === step.number ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-8 h-1 w-24 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Tell us about your business</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="What services do you provide?"
                    value={businessSetup.description}
                    onChange={(e) => handleBusinessUpdate('description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                    value={businessSetup.phone}
                    onChange={(e) => handleBusinessUpdate('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                    value={businessSetup.address}
                    onChange={(e) => handleBusinessUpdate('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourbusiness.com"
                    value={businessSetup.website}
                    onChange={(e) => handleBusinessUpdate('website', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                    value={businessSetup.city}
                    onChange={(e) => handleBusinessUpdate('city', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NY"
                      value={businessSetup.state}
                      onChange={(e) => handleBusinessUpdate('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10001"
                      value={businessSetup.zipCode}
                      onChange={(e) => handleBusinessUpdate('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Set up your services</h2>
              <p className="text-gray-600 mb-6">
                Add the services you offer. You can always add more later.
              </p>
              
              {services.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Service {index + 1}</h3>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Hair Cut"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={service.durationMinutes}
                        onChange={(e) => updateService(index, 'durationMinutes', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={service.priceCents / 100}
                        onChange={(e) => updateService(index, 'priceCents', Math.round(parseFloat(e.target.value) * 100))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Service description..."
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addService}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-gray-600 hover:border-blue-500 hover:text-blue-600"
              >
                + Add Another Service
              </button>
            </div>
          )}

          {/* Step 3: Customization */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Customize your brand</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      className="w-12 h-12 border border-gray-300 rounded-md"
                      value={businessSetup.primaryColor}
                      onChange={(e) => handleBusinessUpdate('primaryColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={businessSetup.primaryColor}
                      onChange={(e) => handleBusinessUpdate('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={businessSetup.timezone}
                    onChange={(e) => handleBusinessUpdate('timezone', e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Preview</h3>
                <div 
                  className="border rounded-lg p-6 bg-white"
                  style={{ borderColor: businessSetup.primaryColor }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: businessSetup.primaryColor }}
                    ></div>
                    <div>
                      <h4 className="font-semibold">Your Business Name</h4>
                      <p className="text-sm text-gray-600">{businessSetup.description || 'Your business description will appear here'}</p>
                    </div>
                  </div>
                  <button 
                    className="text-white px-6 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: businessSetup.primaryColor }}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
                <Check className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
