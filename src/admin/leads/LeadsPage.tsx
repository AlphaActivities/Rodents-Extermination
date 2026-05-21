import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LeadCard, { Lead } from './LeadCard';
import StatCardsRow, { computeStats, applyFilter } from '../components/StatCardsRow';
import { FilterKey } from '../components/StatCard';
import { Users, Filter } from 'lucide-react';

interface OutletContext {
  setRefreshFn: (fn: (() => void) | null) => void;
}

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All Leads',
  today: "Today's Leads",
  insulation: 'Insulation Leads',
  follow_up: 'Needs Follow-Up',
};

export default function LeadsPage() {
  const { setRefreshFn } = useOutletContext<OutletContext>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

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

  const stats = useMemo(() => computeStats(leads), [leads]);
  const filteredLeads = useMemo(
    () => applyFilter(leads, activeFilter),
    [leads, activeFilter]
  );

  const handleFilterChange = useCallback((key: FilterKey) => {
    // Toggle off → reset to all; clicking active card again resets
    setActiveFilter((prev) => (prev === key ? 'all' : key));
  }, []);

  const isFiltered = activeFilter !== 'all';

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">

      {/* ── Stat cards ───────────────────────────────────────── */}
      <StatCardsRow
        stats={stats}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      {/* ── List header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 mb-4">
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--db-text-1)' }}
          >
            {loading ? 'Loading…' : FILTER_LABELS[activeFilter]}
          </h2>
          {!loading && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--db-text-3)' }}>
              {isFiltered
                ? `${filteredLeads.length} of ${leads.length} leads`
                : `${leads.length} lead${leads.length !== 1 ? 's' : ''} · newest first`}
            </p>
          )}
        </div>

        {isFiltered && !loading && (
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="db-btn-ghost flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
          >
            <Filter className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 mb-4 text-center"
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
            className="mt-2 text-xs font-medium hover:opacity-80 transition-opacity"
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

      {/* ── Empty: no leads at all ────────────────────────────── */}
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
            <Users className="w-7 h-7" style={{ color: 'var(--db-text-3)' }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--db-text-2)' }}>
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

      {/* ── Empty: filter returns zero ────────────────────────── */}
      {!loading && !error && leads.length > 0 && filteredLeads.length === 0 && (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: 'var(--db-surface)',
            border: '1px solid var(--db-border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--db-elevated)' }}
          >
            <Filter className="w-5 h-5" style={{ color: 'var(--db-text-3)' }} />
          </div>
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--db-text-2)' }}>
            No leads match this filter
          </p>
          <p
            className="text-xs leading-relaxed max-w-xs mx-auto mb-4"
            style={{ color: 'var(--db-text-3)' }}
          >
            {FILTER_LABELS[activeFilter]} returned 0 results.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="db-btn-ghost text-xs px-3 py-1.5 rounded-lg"
          >
            Show all leads
          </button>
        </div>
      )}

      {/* ── Lead list ────────────────────────────────────────── */}
      {!loading && !error && filteredLeads.length > 0 && (
        <div className="space-y-3">
          {filteredLeads.map((lead, i) => (
            <LeadCard key={lead.id} lead={lead} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
