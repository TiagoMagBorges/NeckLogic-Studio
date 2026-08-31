import { createContext } from 'react';
import type { StudioUser } from '../types/auth';

export interface AuthContextValue {
  user: StudioUser | null;
  login: (email: string, password: string, keepLoggedIn: boolean) => Promise<void>;
  verifyAccount: (email: string, token: string) => Promise<void>;
  updateUser: (user: StudioUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);