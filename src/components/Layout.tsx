import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { LanguageDropdown } from './LanguageDropdown';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/10">
        <span className="font-bold text-lg tracking-tight">
          Neck<span className="text-primary">Logic</span> Studio
        </span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LanguageDropdown />
          <span>{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-border/10 text-foreground rounded-lg px-3 py-2 text-sm"
          >
            {t('layout.signOut')}
          </button>
        </div>
      </header>

      <main className="px-6 py-6 max-w-[960px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}