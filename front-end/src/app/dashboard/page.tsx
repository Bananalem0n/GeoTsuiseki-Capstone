'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
    Package,
    Scan,
    Handshake,
    Star,
    Plus,
    BarChart3,
    CheckCircle,
    Users,
    Rocket,
    Loader2,
    Phone,
    Building2,
    Activity,
} from '@/lib/icons';

interface Analytics {
    totalProducts: number;
    totalScans: number;
    totalPartners: number;
    recentProducts: { id: string; name: string }[];
}

export default function DashboardPage() {
    const { user, isAdmin, isPartner } = useAuth();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [partnerRequest, setPartnerRequest] = useState({ businessName: '', phone: '', description: '' });
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [requestError, setRequestError] = useState('');

    const isRegularUser = !isAdmin && !isPartner;

    useEffect(() => {
        loadDashboardData();
    }, [isAdmin]);

    const loadDashboardData = async () => {
        try {
            const productsRes = await api.getProducts(1, 5) as { data: unknown[]; meta: { total: number } };

            let partnersCount = 0;
            if (isAdmin) {
                try {
                    const partnersRes = await api.getPartners(1, 1) as { meta: { total: number } };
                    partnersCount = partnersRes.meta?.total || 0;
                } catch {
                    // Ignore
                }
            }

            setAnalytics({
                totalProducts: productsRes.meta?.total || 0,
                totalScans: 0,
                totalPartners: partnersCount,
                recentProducts: (productsRes.data || []).slice(0, 5) as { id: string; name: string }[],
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePartnerRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestLoading(true);
        setRequestError('');

        try {
            await api.requestPartnerStatus(partnerRequest);
            setRequestSuccess(true);
            setShowPartnerModal(false);
            setPartnerRequest({ businessName: '', phone: '', description: '' });
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const statsCards = [
        { label: 'Total Products', value: analytics?.totalProducts || 0, icon: Package, gradient: 'from-indigo-500 to-blue-500', iconBg: 'bg-indigo-500/20' },
        { label: 'Total Scans', value: analytics?.totalScans || 0, icon: Scan, gradient: 'from-purple-500 to-pink-500', iconBg: 'bg-purple-500/20' },
        { label: 'Partners', value: analytics?.totalPartners || 0, icon: Handshake, gradient: 'from-cyan-500 to-teal-500', iconBg: 'bg-cyan-500/20' },
        { label: 'Avg Rating', value: '4.8', icon: Star, gradient: 'from-yellow-500 to-orange-500', iconBg: 'bg-yellow-500/20' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-400 mt-1">
                    {isAdmin
                        ? "Manage users and review partner applications."
                        : isPartner
                            ? "Manage your products and view analytics."
                            : "Browse products and become a partner to start selling."}
                </p>
            </div>

            {/* Partner Request Success Message */}
            {requestSuccess && (
                <div className="glass-card p-4 border border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-medium text-green-400">Partner request submitted!</p>
                            <p className="text-sm text-gray-400">An admin will review your application soon.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Become a Partner CTA */}
            {isRegularUser && !requestSuccess && (
                <div className="relative overflow-hidden glass-card p-6 border border-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Become a Partner</h2>
                                <p className="text-gray-400 mt-1">
                                    Register your business to add products and generate QR codes.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPartnerModal(true)}
                            className="btn-primary whitespace-nowrap flex items-center gap-2"
                        >
                            <Rocket className="w-4 h-4" />
                            Get Started
                        </button>
                    </div>
                </div>
            )}

            {/* Stats cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: 'currentColor' }} />
                                </div>
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient}`} />
                            </div>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick actions */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {isPartner && (
                            <>
                                <Link href="/dashboard/products" className="flex items-center justify-center gap-2 btn-primary py-4">
                                    <Plus className="w-5 h-5" />
                                    Add Product
                                </Link>
                                <Link href="/dashboard/products" className="flex items-center justify-center gap-2 btn-secondary py-4">
                                    <BarChart3 className="w-5 h-5" />
                                    Analytics
                                </Link>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <Link href="/dashboard/approvals" className="flex items-center justify-center gap-2 btn-primary py-4">
                                    <CheckCircle className="w-5 h-5" />
                                    Approvals
                                </Link>
                                <Link href="/dashboard/users" className="flex items-center justify-center gap-2 btn-secondary py-4">
                                    <Users className="w-5 h-5" />
                                    Users
                                </Link>
                                <Link href="/dashboard/partners" className="flex items-center justify-center gap-2 btn-secondary py-4">
                                    <Handshake className="w-5 h-5" />
                                    Partners
                                </Link>
                                <Link href="/dashboard/products" className="flex items-center justify-center gap-2 btn-secondary py-4">
                                    <Package className="w-5 h-5" />
                                    Products
                                </Link>
                            </>
                        )}

                        {isRegularUser && (
                            <>
                                <Link href="/dashboard/products" className="flex items-center justify-center gap-2 btn-secondary py-4">
                                    <Package className="w-5 h-5" />
                                    Browse
                                </Link>
                                <button
                                    onClick={() => setShowPartnerModal(true)}
                                    className="flex items-center justify-center gap-2 btn-primary py-4"
                                >
                                    <Rocket className="w-5 h-5" />
                                    Partner
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {[
                            { text: 'Product scanned', time: '2 minutes ago', icon: Scan },
                            { text: 'New partner joined', time: '15 minutes ago', icon: Handshake },
                            { text: 'Product added', time: '1 hour ago', icon: Package },
                        ].map((activity, i) => {
                            const Icon = activity.icon;
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{activity.text}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                    <Activity className="w-4 h-4 text-gray-600" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Partner Request Modal */}
            {showPartnerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPartnerModal(false)} />
                    <div className="glass-card p-6 w-full max-w-md relative z-10 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Become a Partner</h2>
                                <p className="text-gray-400 text-sm">Submit your business for review</p>
                            </div>
                        </div>

                        {requestError && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                                {requestError}
                            </div>
                        )}

                        <form onSubmit={handlePartnerRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    <Building2 className="w-4 h-4 inline mr-2" />
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    value={partnerRequest.businessName}
                                    onChange={(e) => setPartnerRequest({ ...partnerRequest, businessName: e.target.value })}
                                    className="input"
                                    placeholder="Your company name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={partnerRequest.phone}
                                    onChange={(e) => setPartnerRequest({ ...partnerRequest, phone: e.target.value })}
                                    className="input"
                                    placeholder="+62 xxx xxxx xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Description</label>
                                <textarea
                                    value={partnerRequest.description}
                                    onChange={(e) => setPartnerRequest({ ...partnerRequest, description: e.target.value })}
                                    className="input min-h-[100px]"
                                    placeholder="Tell us about your business..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPartnerModal(false)}
                                    className="btn-secondary flex-1"
                                    disabled={requestLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    disabled={requestLoading}
                                >
                                    {requestLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Submit
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
