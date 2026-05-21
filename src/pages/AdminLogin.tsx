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

    // Verify user is in the admins table
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Admin Portal</h1>
          <p className="text-sm text-neutral-500 mt-1">Rodents Exterm &amp; Insulation LLC</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="admin-email">
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
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2" htmlFor="admin-password">
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
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-neutral-50 hover:bg-white min-h-[48px]"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 min-h-[48px] disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
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

        <p className="text-center text-xs text-neutral-400 mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
