import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface Props {
  onSignOut: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/admin/leads': 'Leads',
  '/admin': 'Leads',
  '/admin/analytics': 'Analytics',
  '/admin/jobs': 'Jobs',
  '/admin/customers': 'Customers',
  '/admin/settings': 'Settings',
};

export default function DashboardShell({ onSignOut }: Props) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('db-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Refresh callback — passed down via context to child pages via Outlet context
  const [refreshFn, setRefreshFn] = useState<(() => void) | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '');
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('db-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    onSignOut();
  }, [onSignOut]);

  const handleRefresh = refreshFn
    ? async () => {
        setRefreshing(true);
        await refreshFn();
        setRefreshing(false);
      }
    : undefined;

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div
      data-app="admin"
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--db-bg)' }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          pageTitle={pageTitle}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--db-bg)' }}>
          <Outlet context={{ setRefreshFn }} />
        </main>
      </div>
    </div>
  );
}
