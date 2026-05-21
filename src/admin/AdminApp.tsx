import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import DashboardShell from './shell/DashboardShell';
import LeadsPage from './leads/LeadsPage';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

function buildRouter(onSignOut: () => void) {
  return createBrowserRouter([
    {
      path: '/admin',
      element: <DashboardShell onSignOut={onSignOut} />,
      children: [
        { index: true, element: <Navigate to="/admin/leads" replace /> },
        { path: 'leads', element: <LeadsPage /> },
      ],
    },
    // Catch-all: redirect any unknown /admin/* back to /admin/leads
    {
      path: '/admin/*',
      element: <Navigate to="/admin/leads" replace />,
    },
  ]);
}

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase
          .from('admins')
          .select('id')
          .eq('id', data.session.user.id)
          .maybeSingle()
          .then(({ data: adminRow }) => {
            if (adminRow) {
              setAuthState('authenticated');
            } else {
              supabase.auth.signOut();
              setAuthState('unauthenticated');
            }
          });
      } else {
        setAuthState('unauthenticated');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthState('unauthenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState === 'loading') {
    return (
      <div
        data-app="admin"
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--db-bg)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--db-border-hi)', borderTopColor: 'var(--db-accent)' }}
        />
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin onAuthenticated={() => setAuthState('authenticated')} />;
  }

  const router = buildRouter(() => setAuthState('unauthenticated'));
  return <RouterProvider router={router} />;
}
