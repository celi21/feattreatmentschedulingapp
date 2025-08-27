'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, CreditCard } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
}

interface Provider {
  id: string;
  name: string;
  bio: string | null;
}

interface Business {
  id: string;
  name: string;
  primaryColor: string;
  timezone: string;
}

interface BookingWidgetProps {
  business: Business;
  services: Service[];
  providers: Provider[];
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function BookingWidget({ business, services, providers }: BookingWidgetProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(providers[0] || null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const currentStep = !selectedService || !selectedProvider ? 1 : 
                     !selectedDate ? 2 : 
                     !selectedSlot ? 3 : 4;

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedProvider || !selectedDate) return;
    
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const response = await fetch(
        `/api/business/${business.id}/availability?providerId=${selectedProvider.id}&date=${selectedDate}`
      );
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedProvider, selectedDate, business.id]);

  useEffect(() => {
    if (selectedService && selectedProvider && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedProvider, selectedDate, fetchAvailableSlots]);

  const handleBooking = async () => {
    if (!selectedService || !selectedProvider || !selectedSlot || !customerName || !customerEmail) {
      setBookingMessage('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    setBookingMessage('');

    try {
      const response = await fetch(`/api/business/${business.id}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          providerId: selectedProvider.id,
          start: selectedSlot.start,
          clientName: customerName,
          clientEmail: customerEmail,
          clientPhone: customerPhone,
          notes: notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingMessage('✅ Appointment booked successfully! You will receive a confirmation email.');
        // Reset form
        setSelectedSlot(null);
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
        setNotes('');
      } else {
        setBookingMessage(`❌ ${data.error || 'Failed to book appointment'}`);
      }
    } catch (error) {
      setBookingMessage('❌ Network error. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toFixed(2);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: business.timezone 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Progress indicators */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              <div className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 && 'Service'}
                {step === 2 && 'Date'}
                {step === 3 && 'Time'}
                {step === 4 && 'Details'}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Service & Provider Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Choose Service & Provider
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value);
                  setSelectedService(service || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${formatPrice(service.priceCents)} ({service.durationMinutes}min)
                  </option>
                ))}
              </select>
              {selectedService?.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <select
                value={selectedProvider?.id || ''}
                onChange={(e) => {
                  const provider = providers.find(p => p.id === e.target.value);
                  setSelectedProvider(provider || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              {selectedProvider?.bio && (
                <p className="text-sm text-gray-600 mt-1">{selectedProvider.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Date Selection */}
        {selectedService && selectedProvider && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Select Date
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Step 3: Time Selection */}
        {selectedService && selectedProvider && selectedDate && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Available Times
            </h3>
            
            {isLoadingSlots ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading available times...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2 text-sm font-medium rounded-md border ${
                      selectedSlot?.start === slot.start
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No available times for this date</p>
                <p className="text-sm text-gray-500">Try selecting a different date</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer Details */}
        {selectedSlot && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Your Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span>{selectedProvider?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span>
                    {new Date(selectedDate).toLocaleDateString()} at {formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{selectedService?.durationMinutes} minutes</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total:</span>
                  <span>${formatPrice(selectedService?.priceCents || 0)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={isBooking || !customerName || !customerEmail}
              style={{ backgroundColor: business.primaryColor }}
              className="w-full text-white px-6 py-3 rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? 'Booking...' : 'Book Appointment'}
            </button>

            {bookingMessage && (
              <div className={`text-center text-sm ${
                bookingMessage.includes('✅') ? 'text-green-600' : 'text-red-600'
              }`}>
                {bookingMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
