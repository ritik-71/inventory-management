"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiInstance } from '../utils/apiClient';

interface AuthContextType {
  token: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  login: (token: string, email: string, name?: string, role?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // Silent session restore on app mount only (avoids race condition loops on route transition)
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log("AuthContext: Validating active session cookie on startup...");
        // Make standard refresh request which automatically passes secure HTTP cookies
        const response: any = await apiInstance.post('/api/auth/refresh');
        
        const restoredToken = response.token;
        const restoredEmail = response.email;
        const restoredName = response.name;
        const restoredRole = response.role;

        if (restoredToken && restoredEmail) {
          console.log("AuthContext: Cookie session verified successfully on startup!");
          setToken(restoredToken);
          setEmail(restoredEmail);
          setName(restoredName || null);
          setRole(restoredRole || null);
          
          localStorage.setItem('token', restoredToken);
          localStorage.setItem('email', restoredEmail);
          if (restoredName) localStorage.setItem('name', restoredName);
          if (restoredRole) localStorage.setItem('role', restoredRole);
          
          // Only redirect if they are on auth landing page or registration
          if (pathname === '/' || pathname.startsWith('/register')) {
            router.push('/dashboard');
          }
        } else {
          throw new Error("No token returned from refresh");
        }
      } catch (error) {
        console.log("AuthContext: No active or valid cookie session found on startup. Attempting localStorage fallback...");
        
        // Fallback to localStorage credentials on boot if cookies are not fully setup
        const localToken = localStorage.getItem('token');
        const localEmail = localStorage.getItem('email');
        const localName = localStorage.getItem('name');
        const localRole = localStorage.getItem('role');

        if (localToken && localEmail) {
          console.log("AuthContext: Local storage session fallback loaded.");
          setToken(localToken);
          setEmail(localEmail);
          setName(localName);
          setRole(localRole);
          
          if (pathname === '/' || pathname.startsWith('/register')) {
            router.push('/dashboard');
          }
        } else {
          console.log("AuthContext: Session completely unauthenticated.");
          setToken(null);
          setEmail(null);
          setName(null);
          setRole(null);
          
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          localStorage.removeItem('name');
          localStorage.removeItem('role');

          if (pathname !== '/' && !pathname.startsWith('/register')) {
            router.push('/');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []); // Run ONCE on initial mount only

  const login = (newToken: string, newEmail: string, newName?: string, newRole?: string) => {
    console.log("AuthContext: Initiating secure login state maps...");
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', newEmail);
    if (newName) localStorage.setItem('name', newName);
    if (newRole) localStorage.setItem('role', newRole);

    setToken(newToken);
    setEmail(newEmail);
    setName(newName || null);
    setRole(newRole || null);
    
    // Direct redirect to dashboard after state is fully committed
    router.push('/dashboard');
  };

  const logout = async () => {
    console.log("AuthContext: Logging out user and clearing sessions...");
    try {
      // Direct call to revoke cookies on backend
      await apiInstance.post('/api/auth/logout');
    } catch (e) {
      console.warn("AuthContext: Revoking session cookies failed on server.", e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      localStorage.removeItem('role');
      
      setToken(null);
      setEmail(null);
      setName(null);
      setRole(null);
      
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      email, 
      name,
      role,
      login, 
      logout, 
      isAuthenticated: !!token, 
      loading 
    }}>
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
