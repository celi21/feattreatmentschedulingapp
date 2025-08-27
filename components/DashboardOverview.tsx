'use client';

import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
}

interface Product {
  id: string;
  name: string;
  priceCents: number;
}

interface Appointment {
  id: string;
  start: string;
  clientName: string;
  clientEmail: string;
  status: string;
  service: Service;
  provider: {
    name: string;
  };
}

interface Business {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
  services: Service[];
  products: Product[];
  appointments: Appointment[];
  _count: {
    services: number;
    products: number;
    appointments: number;
  };
}

interface DashboardOverviewProps {
  business: Business;
}

export default function DashboardOverview({ business }: DashboardOverviewProps) {
  const stats = [
    {
      name: 'Total Appointments',
      value: business._count.appointments,
      icon: Calendar,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Monthly Revenue',
      value: '$2,400',
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Services',
      value: business._count.services,
      icon: Users,
      change: `${8 - business._count.services} remaining`,
      changeType: business.subscriptionTier === 'FREE' ? ('neutral' as const) : ('positive' as const),
    },
    {
      name: 'Conversion Rate',
      value: '68%',
      icon: TrendingUp,
      change: '+4%',
      changeType: 'positive' as const,
    },
  ];

  const recentAppointments = business.appointments.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600">Here&apos;s what&apos;s happening with {business.name} today.</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/book/${business.slug}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
            <Link
              href="/dashboard/services"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent appointments */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
              <Link
                href="/dashboard/appointments"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.clientName}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.service.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(appointment.start).toLocaleDateString()} at{' '}
                        {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet</p>
                <p className="text-sm text-gray-400">Share your booking link to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link
                href="/dashboard/services"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Manage Services</h4>
                  <p className="text-sm text-gray-500">Add or edit your service offerings</p>
                </div>
              </Link>

              <Link
                href="/dashboard/products"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <Plus className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Add Products</h4>
                  <p className="text-sm text-gray-500">Create your product catalog</p>
                </div>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <ExternalLink className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Customize Branding</h4>
                  <p className="text-sm text-gray-500">Update your brand colors and logo</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription tier info */}
      {business.subscriptionTier === 'FREE' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">
                You&apos;re on the Free plan
              </h3>
              <p className="text-blue-700">
                You have {8 - business._count.services} service slots remaining. 
                Upgrade to add unlimited services and unlock more features.
              </p>
            </div>
            <Link
              href="/dashboard/settings/billing"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
