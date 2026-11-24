import { useState, useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import DashboardShell from './shell/DashboardShell';
import LeadsPage from './leads/LeadsPage';

type AuthState = 'loading' | 'retry' | 'unauthenticated' | 'transitioning' | 'authenticated';

function LoginSuccessOverlay() {
  return (
    <div
      data-app="admin"
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--db-bg)' }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo tile with subtle glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-2xl login-success-glow"
            aria-hidden="true"
          />
          <div
            className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl"
            style={{ background: '#ffffff' }}
          >
            <img
              src="/logo/black_logo.PNG"
              alt=""
              className="object-contain"
              style={{ width: '80%', height: '80%' }}
            />
          </div>
        </div>

        {/* Status text */}
        <div className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--db-success)' }}
          >
            Access granted
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--db-text-2)' }}
          >
            Opening Operations Center
          </p>
        </div>
      </div>
    </div>
  );
}

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

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const {data, error} = await supabase.auth.getSession();
        if (!active) return;
        if (error) { setAuthState('retry'); return; }
        if (!data.session) { setAuthState('unauthenticated'); return; }
        const result = await supabase.from('admins').select('id').eq('id', data.session.user.id).maybeSingle();
        if (!active) return;
        if (result.error) { setAuthState('retry'); return; }
        setAuthState(result.data ? 'authenticated' : 'unauthenticated');
      } catch { if (active) setAuthState('retry'); }
    }
    void restore();
    const {data:{subscription}} = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') { active = false; setAuthState('unauthenticated'); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [attempt]);

  // Manual login callback: show premium transition before entering dashboard.
  // Session restore goes directly to 'authenticated' and never calls this.
  const handleAuthenticated = () => {
    setAuthState('transitioning');
    setTimeout(() => setAuthState('authenticated'), 2900);
  };

  if (authState === 'retry') return <main role="alert">Unable to verify admin access. <button onClick={() => {setAuthState('loading');setAttempt(value => value + 1);}}>Retry connection</button></main>;
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

  if (authState === 'transitioning') {
    return <LoginSuccessOverlay />;
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin onAuthenticated={handleAuthenticated} />;
  }

  return <RouterProvider router={routerRef.current} />;
}
