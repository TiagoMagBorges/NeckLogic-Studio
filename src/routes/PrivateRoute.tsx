import { Navigate, Outlet } from 'react-router';
import { sessionStorageService } from '../services/sessionStorage';

export function PrivateRoute() {
  const isAuthenticated: boolean = !!sessionStorageService.getToken();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}