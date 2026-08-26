export interface LoginResponse {
  token: string;
  onboardingCompleted: boolean;
  xp: number;
  level: number;
  streak: number;
  name: string;
  email: string;
  isTeacher: boolean;
  isAdmin: boolean;
}

export interface StudioUser {
  name: string;
  email: string;
  isTeacher: boolean;
  isAdmin: boolean;
}