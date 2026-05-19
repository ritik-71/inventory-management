"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiInstance } from '../utils/apiClient';

interface AuthContextType {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Silent session restore on app boot
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log("AuthContext: Validating active session cookie on startup...");
        // Make standard refresh request which automatically passes secure HTTP cookies
        const response: any = await apiInstance.post('/api/auth/refresh');
        
        const restoredToken = response.token;
        const restoredEmail = response.email;

        if (restoredToken && restoredEmail) {
          console.log("AuthContext: Cookie session verified successfully!");
          setToken(restoredToken);
          setEmail(restoredEmail);
          localStorage.setItem('token', restoredToken);
          localStorage.setItem('email', restoredEmail);
          
          if (pathname === '/' || pathname.startsWith('/register')) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.log("AuthContext: No active or valid session found. User must login.");
        setToken(null);
        setEmail(null);
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        
        if (pathname !== '/' && !pathname.startsWith('/register')) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [pathname, router]);

  const login = (newToken: string, newEmail: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
    setToken(newToken);
    setEmail(newEmail);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      // Direct call to revoke cookies on backend
      await apiInstance.post('/api/auth/logout');
    } catch (e) {
      console.warn("AuthContext: Revoking session cookies failed on server.", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      setToken(null);
      setEmail(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ token, email, login, logout, isAuthenticated: !!token, loading }}>
      {loading ? (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-mono tracking-wider animate-pulse">VERIFYING DEPLOYMENT SECURITY...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
