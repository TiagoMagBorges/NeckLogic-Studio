import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { LoginResponse, StudioUser } from '../types/auth';
import { AuthContext, TOKEN_KEY, USER_KEY } from './authContext';

function loadStoredUser(): StudioUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StudioUser;
  } catch {
    return null;
  }
}

function applySession(data: LoginResponse, setUser: (user: StudioUser) => void) {
  const studioUser: StudioUser = {
    name: data.name,
    email: data.email,
    isTeacher: data.isTeacher,
    isAdmin: data.isAdmin,
  };

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(studioUser));
  setUser(studioUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudioUser | null>(loadStoredUser);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    applySession(response.data, setUser);
  }, []);

  const verifyAccount = useCallback(async (email: string, token: string) => {
    const response = await api.post<LoginResponse>('/auth/verify-account', { email, token });
    applySession(response.data, setUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, verifyAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}