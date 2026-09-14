import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AccountMenuProps {
  collapsed?: boolean;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AccountMenu({ collapsed }: AccountMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  function handleSignOut() {
    setIsOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  function handleSettings() {
    setIsOpen(false);
    navigate('/account');
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-secondary/60"
      >
        <span className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-[#0891A8] text-primary-foreground font-mono text-[11px] font-extrabold flex items-center justify-center">
          {initialsOf(user.name)}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-xs font-bold truncate">{user.name}</span>
              <span className="block text-[10.5px] text-muted-foreground">
                {user.isAdmin ? t('accountMenu.admin') : t('accountMenu.teacher')}
              </span>
            </span>
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute z-50 bottom-[calc(100%+8px)] ${collapsed ? 'left-0' : 'left-0 right-0'} w-52 bg-secondary border border-border/10 rounded-xl p-1.5 shadow-2xl`}
          >
            <div className="px-2.5 pt-1.5 pb-2 mb-1 border-b border-border/10">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSettings}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold hover:bg-card"
            >
              <Settings size={15} />
              {t('accountMenu.settings')}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-semibold text-destructive hover:bg-card"
            >
              <LogOut size={15} />
              {t('accountMenu.signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
