import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute.tsx';
import { AuthProvider } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import VerifyPage from '../pages/Verify';
import ForgotPasswordPage from '../pages/ForgotPassword';
import ResetPasswordPage from '../pages/ResetPassword';
import DashboardPage from '../pages/Dashboard';
import AccountSettingsPage from '../pages/AccountSettings';
import TrackFormPage from '../pages/TrackForm';
import TrackDetailPage from '../pages/TrackDetail';
import TrackAnalyticsPage from '../pages/TrackAnalytics';
import SectionFormPage from '../pages/SectionForm';
import SectionModulesPage from '../pages/SectionModules';
import ModuleFormPage from '../pages/ModuleForm';

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/account" element={<AccountSettingsPage />} />
              <Route path="/tracks/new" element={<TrackFormPage />} />
              <Route path="/tracks/:id/edit" element={<TrackFormPage />} />
              <Route path="/tracks/:trackId" element={<TrackDetailPage />} />
              <Route path="/tracks/:trackId/analytics" element={<TrackAnalyticsPage />} />
              <Route path="/tracks/:trackId/sections/new" element={<SectionFormPage />} />
              <Route path="/tracks/:trackId/sections/:sectionId/edit" element={<SectionFormPage />} />
              <Route path="/tracks/:trackId/sections/:sectionId/modules" element={<SectionModulesPage />} />
              <Route path="/tracks/:trackId/sections/:sectionId/modules/new" element={<ModuleFormPage />} />
              <Route
                path="/tracks/:trackId/sections/:sectionId/modules/:moduleId/edit"
                element={<ModuleFormPage />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}