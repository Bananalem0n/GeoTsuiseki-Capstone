'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  QrCode,
  Handshake,
  BarChart3,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  Globe,
} from '@/lib/icons';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const features = [
    {
      title: 'QR Tracking',
      description: 'Generate unique QR codes for each product and track every scan in real-time.',
      icon: QrCode,
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Partner Management',
      description: 'Onboard partners, manage approvals, and monitor their product catalog.',
      icon: Handshake,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Analytics',
      description: 'Real-time insights into product scans, ratings, and market trends.',
      icon: BarChart3,
      gradient: 'from-cyan-500 to-teal-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Products Tracked' },
    { value: '500+', label: 'Partner Businesses' },
    { value: '1M+', label: 'QR Scans' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              GeoTsuiseki
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary flex items-center gap-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Trusted by 500+ businesses worldwide
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Track Products.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Build Trust.
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Powerful product tracking and partner management platform with QR code scanning for authentic verification.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              View Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-16 border-t border-gray-800/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Everything you need</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A complete solution for product authentication and partner management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="glass-card p-8 text-center hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-indigo-500/20 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-[1px] mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
            <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join hundreds of businesses already using GeoTsuiseki to track products and manage partners.
            </p>
            <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-400">© 2024 GeoTsuiseki. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-gray-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
