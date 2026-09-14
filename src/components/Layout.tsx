import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LanguageDropdown } from './LanguageDropdown';

export function Layout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-end px-6 py-3.5 border-b border-border/10">
          <LanguageDropdown />
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}