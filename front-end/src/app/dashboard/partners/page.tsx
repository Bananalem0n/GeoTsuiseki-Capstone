'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Handshake,
    Mail,
    Phone,
    MapPin,
    Package,
    Scan,
    Star,
    Loader2,
    X,
    Eye,
    Building2,
} from '@/lib/icons';

interface Partner {
    id: string;
    businessName: string;
    email: string;
    phone?: string;
    address?: string;
    status: string;
    createdAt?: string;
}

interface PartnerAnalytics {
    totalProducts: number;
    totalScans: number;
    averageRating: number;
}

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [analytics, setAnalytics] = useState<PartnerAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const res = await api.getPartners(1, 50) as { data: Partner[] };
            setPartners(res.data || []);
        } catch (error) {
            console.error('Failed to load partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async (partnerId: string) => {
        setAnalyticsLoading(true);
        try {
            const res = await api.getPartnerAnalytics(partnerId) as { data: PartnerAnalytics };
            setAnalytics(res.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
            setAnalytics(null);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleViewDetails = (partner: Partner) => {
        setSelectedPartner(partner);
        loadAnalytics(partner.id);
    };

    const statusColors: Record<string, string> = {
        verified: 'bg-green-500/20 text-green-400 border border-green-500/30',
        pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Partners</h1>
                <p className="text-gray-400 mt-1">View and manage verified business partners</p>
            </div>

            {/* Partners grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : partners.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Handshake className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No partners found</p>
                    <p className="text-gray-500 text-sm">Partners will appear here once approved</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="glass-card p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-transparent hover:border-cyan-500/20"
                            onClick={() => handleViewDetails(partner)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform">
                                    {partner.businessName?.[0]?.toUpperCase() || 'P'}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-lg capitalize ${statusColors[partner.status] || statusColors.pending}`}>
                                    {partner.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{partner.businessName}</h3>
                            <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {partner.email}
                            </p>
                            {partner.phone && (
                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {partner.phone}
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <button className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Partner Details Modal */}
            {selectedPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedPartner(null)} />
                    <div className="glass-card p-6 w-full max-w-lg relative z-10 border border-gray-700/50">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedPartner.businessName?.[0]?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedPartner.businessName}</h2>
                                    <span className={`text-xs px-2 py-1 rounded-lg capitalize ${statusColors[selectedPartner.status] || statusColors.pending}`}>
                                        {selectedPartner.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-800/30 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <span>{selectedPartner.email}</span>
                            </div>
                            {selectedPartner.phone && (
                                <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-800/30 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <span>{selectedPartner.phone}</span>
                                </div>
                            )}
                            {selectedPartner.address && (
                                <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-800/30 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                    <span>{selectedPartner.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Analytics */}
                        <div className="border-t border-gray-700/50 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-400" />
                                Analytics
                            </h3>
                            {analyticsLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                                </div>
                            ) : analytics ? (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                        <Package className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-indigo-400">{analytics.totalProducts}</p>
                                        <p className="text-xs text-gray-400">Products</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                        <Scan className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-purple-400">{analytics.totalScans}</p>
                                        <p className="text-xs text-gray-400">Scans</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                        <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-yellow-400">{analytics.averageRating?.toFixed(1) || '-'}</p>
                                        <p className="text-xs text-gray-400">Rating</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center text-sm">No analytics available</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="btn-secondary w-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
