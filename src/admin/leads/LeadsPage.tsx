import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LeadCard, { Lead } from './LeadCard';
import { Users, AlertTriangle, Clock } from 'lucide-react';

interface OutletContext {
  setRefreshFn: (fn: (() => void) | null) => void;
}

function StatPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
      style={{
        background: 'var(--db-surface)',
        border: '1px solid var(--db-border)',
      }}
    >
      <Icon
        className="w-3.5 h-3.5 shrink-0"
        style={{ color: accent ?? 'var(--db-text-3)' }}
      />
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: 'var(--db-text-1)' }}
      >
        {value}
      </span>
      <span className="text-xs" style={{ color: 'var(--db-text-3)' }}>
        {label}
      </span>
    </div>
  );
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
      .select(
        'id, created_at, name, phone, email, service_name, message, landing_page, page_path, referrer'
      )
      .order('created_at', { ascending: false });
    if (err) {
      setError('Failed to load leads.');
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setRefreshFn(fetchLeads);
    return () => setRefreshFn(null);
  }, [fetchLeads, setRefreshFn]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Derived stats
  const stats = useMemo(() => {
    const now = Date.now();
    const urgent = leads.filter(
      (l) => (now - new Date(l.created_at).getTime()) / 3600000 > 24
    ).length;
    const today = leads.filter((l) => {
      const d = new Date(l.created_at);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    }).length;
    return { total: leads.length, urgent, today };
  }, [leads]);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--db-text-1)' }}
          >
            {loading ? 'Loading…' : 'Leads'}
          </h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--db-text-3)' }}>
          Newest submissions first
        </p>
      </div>

      {/* ── Stat pills — only shown once loaded ──────────────── */}
      {!loading && !error && leads.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <StatPill
            icon={Users}
            label="total"
            value={stats.total}
            accent="var(--db-accent-text)"
          />
          <StatPill
            icon={Clock}
            label="today"
            value={stats.today}
          />
          {stats.urgent > 0 && (
            <StatPill
              icon={AlertTriangle}
              label="need follow-up"
              value={stats.urgent}
              accent="var(--db-error)"
            />
          )}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 mb-6 text-center"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.16)',
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--db-error)' }}
          >
            {error}
          </p>
          <button
            onClick={fetchLeads}
            className="mt-2 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--db-error)' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Skeleton ─────────────────────────────────────────── */}
      {loading && !error && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--db-surface)',
                border: '1px solid var(--db-border)',
              }}
            >
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: 'var(--db-elevated)' }}
                  />
                  <div
                    className="h-3 rounded-md animate-pulse"
                    style={{
                      background: 'var(--db-elevated)',
                      width: `${28 + (i * 7) % 20}%`,
                    }}
                  />
                  <div
                    className="h-4 rounded-full animate-pulse"
                    style={{ background: 'var(--db-elevated)', width: '72px' }}
                  />
                </div>
                <div
                  className="h-2.5 rounded-md animate-pulse"
                  style={{ background: 'var(--db-elevated)', width: '38%' }}
                />
                <div
                  className="h-7 rounded-lg animate-pulse"
                  style={{ background: 'var(--db-elevated)', width: '120px' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {!loading && !error && leads.length === 0 && (
        <div
          className="rounded-2xl p-12 sm:p-16 text-center"
          style={{
            background: 'var(--db-surface)',
            border: '1px solid var(--db-border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--db-elevated)' }}
          >
            <Users
              className="w-7 h-7"
              style={{ color: 'var(--db-text-3)' }}
            />
          </div>
          <p
            className="font-semibold text-sm mb-1"
            style={{ color: 'var(--db-text-2)' }}
          >
            No leads yet
          </p>
          <p
            className="text-xs leading-relaxed max-w-xs mx-auto"
            style={{ color: 'var(--db-text-3)' }}
          >
            Contact form submissions will appear here in real time.
          </p>
        </div>
      )}

      {/* ── Lead list ────────────────────────────────────────── */}
      {!loading && !error && leads.length > 0 && (
        <div className="space-y-3">
          {leads.map((lead, i) => (
            <LeadCard key={lead.id} lead={lead} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
