import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LeadCard, { Lead } from './LeadCard';
import { Users } from 'lucide-react';

interface OutletContext {
  setRefreshFn: (fn: (() => void) | null) => void;
}

export default function LeadsPage() {
  const { setRefreshFn } = useOutletContext<OutletContext>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select('id, created_at, name, phone, email, service_name, message, landing_page, page_path, referrer')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Failed to load leads.');
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  }, []);

  // Register refresh handler with shell
  useEffect(() => {
    setRefreshFn(fetchLeads);
    return () => setRefreshFn(null);
  }, [fetchLeads, setRefreshFn]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-bold" style={{ color: 'var(--db-text-1)' }}>
            {loading ? 'Loading…' : `${leads.length} Lead${leads.length !== 1 ? 's' : ''}`}
          </h2>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--db-text-3)' }}>
          Newest submissions first
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl p-4 mb-6 text-center"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--db-error)' }}>{error}</p>
          <button
            onClick={fetchLeads}
            className="mt-2 text-xs font-medium transition-colors"
            style={{ color: 'var(--db-error)' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && !error && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{
                background: 'var(--db-surface)',
                border: '1px solid var(--db-border)',
              }}
            >
              <div
                className="h-3.5 rounded-md w-1/3 mb-3 animate-pulse"
                style={{ background: 'var(--db-elevated)' }}
              />
              <div
                className="h-3 rounded-md w-1/4 mb-3 animate-pulse"
                style={{ background: 'var(--db-elevated)' }}
              />
              <div
                className="h-3 rounded-md w-2/3 animate-pulse"
                style={{ background: 'var(--db-elevated)' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && leads.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'var(--db-surface)',
            border: '1px solid var(--db-border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--db-elevated)' }}
          >
            <Users className="w-6 h-6" style={{ color: 'var(--db-text-3)' }} />
          </div>
          <p className="font-medium text-sm" style={{ color: 'var(--db-text-2)' }}>No leads yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--db-text-3)' }}>
            Submissions from the contact form will appear here.
          </p>
        </div>
      )}

      {/* Lead list */}
      {!loading && !error && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
