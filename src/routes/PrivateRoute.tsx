import { Navigate, Outlet } from 'react-router';

export function PrivateRoute() {
  const isAuthenticated: boolean = !!localStorage.getItem('necklogic_admin_token');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}