'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Users,
    UserPlus,
    Trash2,
    Mail,
    Lock,
    User,
    Shield,
    Loader2,
    X,
    ChevronDown,
} from '@/lib/icons';

interface UserData {
    uid: string;
    email: string;
    name?: string;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.getUsers(1, 50) as { data: UserData[] };
            setUsers(res.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.createUser(newUser);
            setShowModal(false);
            setNewUser({ email: '', password: '', name: '', role: 'user' });
            loadUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (email: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.deleteUser(email);
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleUpdateRole = async (email: string, role: string) => {
        try {
            await api.updateUserRole(email, role);
            loadUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const roleColors: Record<string, { bg: string; text: string; border: string }> = {
        admin: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        approver: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
        partner: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        user: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
    };

    const getRoleStyles = (role: string) => {
        const styles = roleColors[role] || roleColors.user;
        return `${styles.bg} ${styles.text} ${styles.border}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-gray-400 mt-1">Manage system users and roles</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {/* Users table */}
            <div className="glass-card overflow-hidden border border-gray-700/50">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-2">No users found</p>
                        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 mt-4">
                            <UserPlus className="w-5 h-5" />
                            Add First User
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800/50 border-b border-gray-700/50">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-400 text-sm">User</th>
                                    <th className="text-left p-4 font-medium text-gray-400 text-sm">Role</th>
                                    <th className="text-right p-4 font-medium text-gray-400 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {users.map((user) => (
                                    <tr key={user.uid} className="hover:bg-gray-800/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name || 'Unnamed'}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="relative inline-block">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateRole(user.email, e.target.value)}
                                                    className={`appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm border cursor-pointer ${getRoleStyles(user.role)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="partner">Partner</option>
                                                    <option value="approver">Approver</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.email)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="glass-card p-6 w-full max-w-md relative z-10 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">New User</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <User className="w-4 h-4" />
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <Mail className="w-4 h-4" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="input"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <Lock className="w-4 h-4" />
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <Shield className="w-4 h-4" />
                                    Role
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="input"
                                >
                                    <option value="user">User</option>
                                    <option value="partner">Partner</option>
                                    <option value="approver">Approver</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Create User
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
