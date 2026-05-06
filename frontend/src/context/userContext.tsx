import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken, type LoginRequest, type RegisterRequest, type User } from '../lib/api';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<{ requires2FA: boolean; tempToken?: string; user?: User}>;
  login2FA: (tempToken: string, code: string) => Promise<{ user: User }>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On startup, try to get current user. 
    // If accessToken is null, api() will automatically try to /refresh via cookie.
    const initAuth = async () => {
      try {
        // Instead of /me, try to get a new token from the cookie immediately
        // This populates the _accessToken in api.ts RAM
        const refreshData = await authApi.refresh(); 
        setAccessToken(refreshData.accessToken);
        const userData = await api<User>('/auth/me');
        setUser(userData);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<{ requires2FA: boolean; tempToken?: string;user?: User;}> => {
     const res = await api<{ 
      token?: string;
      user?: User;
      requires2FA?: boolean;
      tempToken?: string;
    }>('/auth/login', { method: 'POST', body: data });

    // 2Fa required = dont set accesstoken or user yet
    if (res.requires2FA) {
      return { requires2FA: true, tempToken: res.tempToken as string};
    }
    
    // normal login
    setAccessToken(res.token!);
    setUser(res.user!);
   
    return { requires2FA: false, user: res.user!};
  };

  const login2FA = async (tempToken: string, code: string): Promise<{user: User;}> => {
    const res = await authApi.login2FA(tempToken, code);
    setAccessToken(res.token);
    setUser(res.user!);
    return {user: res.user! }
  };

  const register = async (data: RegisterRequest) => {
    const res = await api<{ accessToken: string, user: User }>('/auth/register', {
      method: 'POST',
      body: data
    });
    setAccessToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, login2FA, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;