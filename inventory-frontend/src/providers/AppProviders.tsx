"use client";

import React from 'react';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};
