'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  Home, 
  Calendar, 
  ShoppingBag, 
  Users, 
  Settings, 
  BarChart3, 
  Globe, 
  Menu, 
  X,
  LogOut 
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: string;
  _count: {
    services: number;
    products: number;
    appointments: number;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DashboardLayoutProps {
  business: Business;
  user: User;
  children: React.ReactNode;
}

export default function DashboardLayout({ business, user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Services', href: '/dashboard/services', icon: Users },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const tierColors = {
    FREE: 'bg-gray-100 text-gray-800',
    TIER_ONE: 'bg-blue-100 text-blue-800',
    TIER_TWO: 'bg-purple-100 text-purple-800',
  };

  const tierNames = {
    FREE: 'Free',
    TIER_ONE: 'Professional',
    TIER_TWO: 'Enterprise',
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">FeatTreatment</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Business info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{business.name}</h3>
                <p className="text-xs text-gray-500">{business.slug}.feattreatment.app</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tierColors[business.subscriptionTier as keyof typeof tierColors]}`}>
                {tierNames[business.subscriptionTier as keyof typeof tierNames]}
              </span>
            </div>
            <div className="mt-3 flex space-x-4 text-xs text-gray-500">
              <span>{business._count.services} services</span>
              <span>{business._count.products} products</span>
              <span>{business._count.appointments} bookings</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Quick actions */}
          <div className="px-3 py-4 border-t border-gray-200">
            <Link
              href={`/book/${business.slug}`}
              target="_blank"
              className="group flex items-center px-3 py-2 text-sm font-medium text-blue-700 rounded-md hover:bg-blue-50"
            >
              <Globe className="mr-3 h-5 w-5 text-blue-500" />
              View Public Page
            </Link>
          </div>

          {/* User menu */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center px-3 py-2">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/settings/billing"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
