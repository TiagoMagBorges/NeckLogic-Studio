import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AccountMenu } from './AccountMenu';

const COLLAPSE_STORAGE_KEY = 'necklogic_studio_sidebar_collapsed';

function loadCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore storage failures (private browsing, etc.)
      }
      return next;
    });
  }

  const isDashboardActive = location.pathname === '/dashboard' || location.pathname.startsWith('/tracks');

  return (
    <aside
      className={`shrink-0 bg-card border-r border-border/10 flex flex-col gap-1 py-4 px-2.5 transition-[width] duration-150 ${
        collapsed ? 'w-[64px]' : 'w-[216px]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-3">
        {!collapsed && (
          <span className="font-bold text-sm tracking-tight truncate">
            Neck<span className="text-primary">Logic</span>
          </span>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={t('sidebar.toggleCollapse')}
          className="ml-auto w-[26px] h-[26px] shrink-0 flex items-center justify-center rounded-lg border border-border/10 text-muted-foreground hover:text-foreground hover:border-primary/40"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      <Link
        to="/dashboard"
        title={collapsed ? t('sidebar.dashboard') : undefined}
        className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13.5px] font-semibold ${
          isDashboardActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        }`}
      >
        <Home size={17} className="shrink-0" />
        {!collapsed && <span className="truncate">{t('sidebar.dashboard')}</span>}
      </Link>

      <div className="flex-1" />

      <AccountMenu collapsed={collapsed} />
    </aside>
  );
}
