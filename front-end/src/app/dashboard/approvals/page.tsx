'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Building2,
    Loader2,
    X,
    AlertCircle,
    UserCheck,
} from '@/lib/icons';

interface PendingPartner {
    id: string;
    businessName: string;
    ownerName?: string;
    email: string;
    phone?: string;
    description?: string;
    createdAt?: string;
}

export default function ApprovalsPage() {
    const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ action: 'approve' | 'reject'; partner: PendingPartner } | null>(null);

    useEffect(() => {
        loadPendingPartners();
    }, []);

    const loadPendingPartners = async () => {
        try {
            const res = await api.getPendingPartners() as { data: PendingPartner[] };
            setPendingPartners(res.data || []);
        } catch (error) {
            console.error('Failed to load pending partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.approvePartner(id);
            setPendingPartners(prev => prev.filter(p => p.id !== id));
            setConfirmModal(null);
        } catch (error) {
            console.error('Failed to approve partner:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await api.rejectPartner(id);
            setPendingPartners(prev => prev.filter(p => p.id !== id));
            setConfirmModal(null);
        } catch (error) {
            console.error('Failed to reject partner:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Approvals</h1>
                    <p className="text-gray-400 mt-1">Review and manage partner applications</p>
                </div>
                {pendingPartners.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">{pendingPartners.length} pending</span>
                    </div>
                )}
            </div>

            {/* Pending partners list */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : pendingPartners.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No pending approvals</p>
                    <p className="text-gray-500 text-sm">All partner applications have been reviewed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingPartners.map((partner) => (
                        <div key={partner.id} className="glass-card p-6 border border-transparent hover:border-yellow-500/20 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{partner.businessName}</h3>
                                        <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4" />
                                            {partner.email}
                                        </p>
                                        {partner.description && (
                                            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{partner.description}</p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Applied {formatDate(partner.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => setConfirmModal({ action: 'reject', partner })}
                                        className="btn-danger flex items-center gap-2 px-4 py-2"
                                        disabled={actionLoading === partner.id}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => setConfirmModal({ action: 'approve', partner })}
                                        className="btn-primary flex items-center gap-2 px-4 py-2"
                                        disabled={actionLoading === partner.id}
                                    >
                                        {actionLoading === partner.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
                    <div className="glass-card p-6 w-full max-w-md relative z-10 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${confirmModal.action === 'approve'
                                    ? 'bg-green-500/20'
                                    : 'bg-red-500/20'
                                }`}>
                                {confirmModal.action === 'approve' ? (
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                ) : (
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {confirmModal.action === 'approve' ? 'Approve Partner' : 'Reject Partner'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {confirmModal.partner.businessName}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">
                            {confirmModal.action === 'approve'
                                ? 'This will grant partner access and allow them to add products and generate QR codes.'
                                : 'This will reject the partner application. The applicant will need to submit a new request.'}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="btn-secondary flex-1"
                                disabled={actionLoading !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.action === 'approve') {
                                        handleApprove(confirmModal.partner.id);
                                    } else {
                                        handleReject(confirmModal.partner.id);
                                    }
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 ${confirmModal.action === 'approve' ? 'btn-primary' : 'btn-danger'
                                    }`}
                                disabled={actionLoading !== null}
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : confirmModal.action === 'approve' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
