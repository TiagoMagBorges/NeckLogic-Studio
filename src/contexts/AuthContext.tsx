import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { sessionStorageService } from '../services/sessionStorage';
import type { LoginResponse, StudioUser } from '../types/auth';
import { AuthContext } from './authContext';

function loadStoredUser(): StudioUser | null {
  const raw = sessionStorageService.getUserRaw();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StudioUser;
  } catch {
    return null;
  }
}

function applySession(data: LoginResponse, persist: boolean, setUser: (user: StudioUser) => void) {
  const studioUser: StudioUser = {
    name: data.name,
    email: data.email,
    isTeacher: data.isTeacher,
    isAdmin: data.isAdmin,
  };

  sessionStorageService.save(data.token, JSON.stringify(studioUser), persist);
  setUser(studioUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudioUser | null>(loadStoredUser);

  const login = useCallback(async (email: string, password: string, keepLoggedIn: boolean) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    applySession(response.data, keepLoggedIn, setUser);
  }, []);

  const verifyAccount = useCallback(async (email: string, token: string) => {
    const response = await api.post<LoginResponse>('/auth/verify-account', { email, token });
    applySession(response.data, true, setUser);
  }, []);

  const updateUser = useCallback((updatedUser: StudioUser) => {
    sessionStorageService.updateUser(JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorageService.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, verifyAccount, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}