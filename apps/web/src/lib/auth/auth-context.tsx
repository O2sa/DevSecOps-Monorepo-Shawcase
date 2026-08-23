'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../../types/user';
import { authStorage } from './auth-storage';
import { identityApi, LoginPayload, RegisterPayload } from '../api/identity';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const existingToken = authStorage.getAccessToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(existingToken);
      const userProfile = await identityApi.getMe();
      setUser(userProfile);
    } catch (err) {
      // If fetching me fails (e.g. token expired or service down), reset auth
      authStorage.clear();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listen for unauthorized 401 events from apiClient
    const unsubscribe = authStorage.onUnauthorized(() => {
      setUser(null);
      setToken(null);
    });

    fetchCurrentUser();

    return () => {
      unsubscribe();
    };
  }, [fetchCurrentUser]);

  const login = async (payload: LoginPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await identityApi.login(payload);
      authStorage.setAccessToken(response.access);
      if (response.refresh) {
        authStorage.setRefreshToken(response.refresh);
      }
      setToken(response.access);
      const userProfile = await identityApi.getMe();
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    await identityApi.register(payload);
  };

  const logout = (): void => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
