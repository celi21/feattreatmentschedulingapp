'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Check, Star, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FeatTreatment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Build Your Business
              <span className="block text-blue-600">Online Storefront</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create a professional scheduling platform and product catalog for your service business. 
              Accept appointments, sell products, and grow your revenue—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Start Free Today
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 font-semibold text-lg">
                View Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Free tier available • No setup fees • 2.9% transaction fee
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-gray-600">
              Professional tools designed for entrepreneurs and small teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <Zap className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Branded Scheduling</h3>
              <p className="text-gray-600">
                Create custom booking pages with your brand colors, logo, and domain. 
                Professional appearance that builds trust with customers.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Star className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Product Catalog</h3>
              <p className="text-gray-600">
                Upload and sell physical or digital products. Auto-resized photos, 
                inventory management, and integrated checkout.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Built-in Stripe integration for secure payment processing. 
                Your customers&apos; data is always protected.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business Analytics</h3>
              <p className="text-gray-600">
                Track revenue, customer metrics, and business growth. 
                Available on higher tiers.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Check className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Perfect experience on all devices. Your customers can book 
                appointments and make purchases from anywhere.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Star className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
              <p className="text-gray-600">
                Get started in minutes with our guided onboarding. 
                No technical knowledge required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Perfect for getting started</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg font-normal text-gray-600">/month</span></div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 8 services</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Product catalog</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Branded booking page</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>2.9% transaction fee</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Get Started
              </Link>
            </div>

            {/* Tier 1 */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For growing businesses</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">$29<span className="text-lg font-normal text-gray-600">/month</span></div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited services</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited products</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Enhanced customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>2.9% transaction fee</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Tier 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For established businesses</p>
                <div className="text-4xl font-bold text-gray-900 mb-6">$79<span className="text-lg font-normal text-gray-600">/month</span></div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Business analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Marketing tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom domain</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>2.9% transaction fee</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full text-center bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of entrepreneurs building their success with FeatTreatment
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg inline-block"
          >
            Start Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FeatTreatment</h3>
            <p className="text-gray-400 mb-6">
              The complete scheduling and storefront platform for service businesses
            </p>
            <div className="text-gray-500 text-sm">
              © 2024 FeatTreatment. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
