import { createContext } from 'react';
import type { StudioUser } from '../types/auth';

export const TOKEN_KEY = 'necklogic_admin_token';
export const USER_KEY = 'necklogic_admin_user';

export interface AuthContextValue {
  user: StudioUser | null;
  login: (email: string, password: string) => Promise<void>;
  verifyAccount: (email: string, token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);