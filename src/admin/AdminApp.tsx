import { useState, useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import DashboardShell from './shell/DashboardShell';
import LeadsPage from './leads/LeadsPage';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

// Stable sign-out handler passed to DashboardShell — triggers via ref so router
// never needs to be rebuilt when auth state changes.
function useSignOutRef(onSignOut: () => void) {
  const ref = useRef(onSignOut);
  ref.current = onSignOut;
  return ref;
}

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const signOutRef = useSignOutRef(() => setAuthState('unauthenticated'));

  // Router built once — DashboardShell calls signOutRef.current() on sign-out
  const routerRef = useRef(
    createBrowserRouter([
      {
        path: '/admin',
        element: (
          <DashboardShell onSignOut={() => signOutRef.current()} />
        ),
        children: [
          { index: true, element: <Navigate to="/admin/leads" replace /> },
          { path: 'leads', element: <LeadsPage /> },
        ],
      },
      {
        path: '/admin/*',
        element: <Navigate to="/admin/leads" replace />,
      },
    ])
  );

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

  return <RouterProvider router={routerRef.current} />;
}
