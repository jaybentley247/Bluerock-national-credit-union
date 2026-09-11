'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  transaction_limit: number | null;
  last_login: string | null;
  last_login_ip: string | null;
  last_login_location: string | null;
  transfer_paused: boolean;
  transfer_pause_reason: string | null;
  otp_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_MS = 10 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Store the access token then fetch the user profile.
   * Redirect to /admin for admins, /dashboard for regular users.
   */
  const login = async (accessToken: string) => {
    localStorage.setItem('access_token', accessToken);
    try {
      const response = await api.get('/auth/me');
      const userData: User = response.data;
      setUser(userData);
      if (userData.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setUser(null);
      router.push('/login');
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => logout(), INACTIVITY_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [user, logout]);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
