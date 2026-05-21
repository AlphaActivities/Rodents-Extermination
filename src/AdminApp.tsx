import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Verify the session user is in the admins table
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthState('unauthenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin onAuthenticated={() => setAuthState('authenticated')} />;
  }

  return <AdminDashboard onSignOut={() => setAuthState('unauthenticated')} />;
}
