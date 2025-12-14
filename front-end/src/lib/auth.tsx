'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
    uid: string;
    email: string;
    name?: string;
    role: string;
    businessName?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isPartner: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.getCurrentUser() as { data: User };
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password) as { data: User };
        setUser(response.data);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'approver';
    const isPartner = user?.role === 'partner';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isPartner }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
