import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute.tsx';
import { AuthProvider } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import VerifyPage from '../pages/Verify';
import DashboardPage from '../pages/Dashboard';
import TrackFormPage from '../pages/TrackForm';

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tracks/new" element={<TrackFormPage />} />
              <Route path="/tracks/:id/edit" element={<TrackFormPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}