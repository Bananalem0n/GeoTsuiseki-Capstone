'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Handshake,
    CheckCircle,
    Users,
    Menu,
    X,
    LogOut,
    Loader2,
} from '@/lib/icons';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'partner', 'approver', 'user'] },
    { name: 'Products', href: '/dashboard/products', icon: Package, roles: ['admin', 'partner', 'approver', 'user'] },
    { name: 'Partners', href: '/dashboard/partners', icon: Handshake, roles: ['admin', 'approver'] },
    { name: 'Approvals', href: '/dashboard/approvals', icon: CheckCircle, roles: ['admin', 'approver'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin'] },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const userRole = user.role?.toLowerCase() || 'user';
    const filteredNav = navItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="min-h-screen flex bg-gray-950">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 
                transform transition-transform duration-300 lg:translate-x-0 lg:static
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                GeoTsuiseki
                            </h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {filteredNav.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'}
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-gray-800/50">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {user.name || user.email}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-700/50 rounded-full inline-block mt-1">
                                        {userRole}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/login');
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar (mobile) */}
                <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center px-4 lg:hidden sticky top-0 z-40">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6 text-gray-300" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-300" />
                        )}
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white">GeoTsuiseki</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
