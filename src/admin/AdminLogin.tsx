import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  onAuthenticated: () => void;
}

export default function AdminLogin({ onAuthenticated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !authData.user) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    const { data: adminRow, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      await supabase.auth.signOut();
      setError('Access denied. This account is not authorized.');
      setLoading(false);
      return;
    }

    onAuthenticated();
  };

  return (
    <div
      data-app="admin"
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--db-bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 shadow-lg"
            style={{ background: 'var(--db-accent)' }}
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--db-text-1)' }}
          >
            Admin Portal
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--db-text-3)' }}>
            Rodents Exterm &amp; Insulation LLC
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--db-surface)',
            border: '1px solid var(--db-border)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                htmlFor="admin-email"
                style={{ color: 'var(--db-text-2)' }}
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@example.com"
                className="db-input w-full"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                htmlFor="admin-password"
                style={{ color: 'var(--db-text-2)' }}
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                className="db-input w-full"
              />
            </div>

            {error && (
              <p
                className="text-sm text-center py-2 px-3 rounded-lg"
                style={{
                  color: 'var(--db-error)',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="db-btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--db-text-3)' }}>
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
