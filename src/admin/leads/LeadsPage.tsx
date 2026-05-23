import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LeadCard, { Lead, LeadStatus } from './LeadCard';
import LeadDrawer from './LeadDrawer';
import StatCardsRow, { computeStats, applyFilter } from '../components/StatCardsRow';
import { FilterKey } from '../components/StatCard';
import { Users, Filter, Search, X } from 'lucide-react';

interface OutletContext {
  setRefreshFn: (fn: (() => void) | null) => void;
  adminName: string;
}

const TILE_LABELS: Record<FilterKey, string> = {
  all: 'Inbox',
  new_leads: 'Fresh Leads',
  active_jobs: 'Active Jobs',
  check_in: 'Check In',
};

const TILE_EMPTY: Record<FilterKey, { headline: string; sub: string }> = {
  all: {
    headline: 'Inbox is clear',
    sub: 'No open leads right now.',
  },
  new_leads: {
    headline: 'No fresh leads waiting',
    sub: 'All inbound leads have been contacted.',
  },
  active_jobs: {
    headline: 'No active jobs',
    sub: 'No leads are currently being worked.',
  },
  check_in: {
    headline: 'No quotes pending',
    sub: 'No leads are waiting on a decision.',
  },
};

type StatusChip = LeadStatus | 'all';

interface StatusChipDef {
  key: StatusChip;
  label: string;
  color?: string;
  bg?: string;
  border?: string;
}

const STATUS_CHIPS: StatusChipDef[] = [
  { key: 'all', label: 'All' },
  {
    key: 'new',
    label: 'New',
    color: '#60a5fa',
    bg: 'rgba(37,99,235,0.10)',
    border: 'rgba(37,99,235,0.22)',
  },
  {
    key: 'contacted',
    label: 'Contacted',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.22)',
  },
  {
    key: 'quoted',
    label: 'Quoted',
    color: '#c084fc',
    bg: 'rgba(168,85,247,0.10)',
    border: 'rgba(168,85,247,0.22)',
  },
  {
    key: 'closed',
    label: 'Closed',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.22)',
  },
  {
    key: 'archived',
    label: 'Archived',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.09)',
    border: 'rgba(107,114,128,0.20)',
  },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function matchesSearch(lead: Lead, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  return (
    normalize(lead.name).includes(q) ||
    normalize(lead.phone).includes(q) ||
    (lead.email ? normalize(lead.email).includes(q) : false) ||
    (lead.service_name ? normalize(lead.service_name).includes(q) : false) ||
    (lead.message ? normalize(lead.message).includes(q) : false)
  );
}

export default function LeadsPage() {
  const { setRefreshFn, adminName } = useOutletContext<OutletContext>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [statusChip, setStatusChip] = useState<StatusChip>('all');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('leads')
      .select(
        'id, created_at, name, phone, email, service_name, message, landing_page, page_path, referrer, status'
      )
      .order('created_at', { ascending: false });
    if (err) {
      setError('Failed to load leads.');
    } else {
      const fresh = (data ?? []) as Lead[];
      setLeads(fresh);
      setSelectedLead((prev) => {
        if (!prev) return null;
        return fresh.find((l) => l.id === prev.id) ?? null;
      });
    }
    setLoading(false);
  }, []);

  // Wrap fetchLeads in an object to avoid the functional-updater trap in DashboardShell
  useEffect(() => {
    setRefreshFn(fetchLeads);
    return () => setRefreshFn(null);
  }, [fetchLeads, setRefreshFn]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = useCallback((id: number, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setSelectedLead((prev) => (prev?.id === id ? { ...prev, status } : prev));
    fetchLeads();
  }, [fetchLeads]);

  // Worklist: all leads (archived chip bypasses to raw leads for its own filter pass)
  // computeStats internally excludes closed + archived from the Inbox count
  const stats = useMemo(() => computeStats(leads), [leads]);

  // Closed count for the chip badge
  const closedCount = useMemo(
    () => leads.filter((l) => l.status === 'closed').length,
    [leads]
  );

  // Apply tile filter → status chip → search. Archived chip bypasses tile filter.
  const visibleLeads = useMemo(() => {
    const isArchived = statusChip === 'archived';
    const isClosed = statusChip === 'closed';
    // Closed and archived chips bypass the tile filter entirely
    const base = isArchived || isClosed ? leads : leads.filter((l) => !['closed', 'archived'].includes(l.status));
    let result = applyFilter(base, isArchived || isClosed ? 'all' : activeFilter);
    if (statusChip !== 'all') {
      result = result.filter((l) => l.status === statusChip);
    }
    if (search.trim()) {
      result = result.filter((l) => matchesSearch(l, search));
    }
    return result;
  }, [leads, activeFilter, statusChip, search]);

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter((prev) => (prev === key ? 'all' : key));
  }, []);

  const clearAll = useCallback(() => {
    setActiveFilter('all');
    setStatusChip('all');
    setSearch('');
  }, []);

  const hasAnyFilter =
    activeFilter !== 'all' || statusChip !== 'all' || search.trim() !== '';

  const countLabel = useMemo(() => {
    if (loading) return null;
    const parts: string[] = [];
    if (activeFilter !== 'all') parts.push(TILE_LABELS[activeFilter]);
    if (statusChip !== 'all') parts.push(statusChip);
    if (search.trim()) parts.push(`"${search.trim()}"`);
    if (parts.length === 0) {
      const open = leads.filter((l) => !['closed', 'archived'].includes(l.status)).length;
      return `${open} lead${open !== 1 ? 's' : ''} · newest first`;
    }
    return `${visibleLeads.length} of ${leads.length} · ${parts.join(', ')}`;
  }, [loading, leads, visibleLeads.length, activeFilter, statusChip, search]);

  // Tile-aware empty state — only used when tile filter is active and no status chip/search
  const tileEmptyState =
    !loading &&
    !error &&
    leads.length > 0 &&
    visibleLeads.length === 0 &&
    statusChip === 'all' &&
    !search.trim()
      ? TILE_EMPTY[activeFilter]
      : null;

  return (
    <>
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">

        {/* ── Stat cards ─────────────────────────────────────── */}
        <StatCardsRow
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* ── Search + status chips ───────────────────────────── */}
        <div className="mt-5 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--db-text-3)' }}
            />
            <input
              type="search"
              className="db-input db-search-input"
              placeholder="Search by name, phone, email, service, or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search leads"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 db-icon-btn w-6 h-6 rounded"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status chips */}
          <div className="db-chip-row">
            {STATUS_CHIPS.map(({ key, label, color, bg, border }) => {
              const isActive = statusChip === key;
              const count = key === 'closed' ? closedCount : undefined;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusChip(key)}
                  className="db-chip"
                  data-active={isActive ? 'true' : undefined}
                  style={
                    !isActive && color
                      ? { color, background: bg, borderColor: border }
                      : undefined
                  }
                  aria-pressed={isActive}
                >
                  {label}
                  {count !== undefined && count > 0 && (
                    <span
                      className="ml-1.5 inline-flex items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                      style={{
                        minWidth: '1.1rem',
                        height: '1.1rem',
                        padding: '0 0.25rem',
                        background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(52,211,153,0.18)',
                        color: isActive ? 'inherit' : '#34d399',
                        fontSize: '0.65rem',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── List header ────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-4 mb-4">
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--db-text-1)' }}
            >
              {loading ? 'Loading…' : TILE_LABELS[activeFilter]}
            </h2>
            {countLabel && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--db-text-3)' }}>
                {countLabel}
              </p>
            )}
          </div>
          {hasAnyFilter && !loading && (
            <button
              type="button"
              onClick={clearAll}
              className="db-btn-ghost flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
            >
              <Filter className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <div
            className="rounded-xl p-4 mb-4 text-center"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.16)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--db-error)' }}>
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

        {/* ── Skeleton ───────────────────────────────────────── */}
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
                      style={{ background: 'var(--db-elevated)', width: `${28 + (i * 7) % 20}%` }}
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

        {/* ── Empty: no leads at all ─────────────────────────── */}
        {!loading && !error && leads.length === 0 && (
          <div
            className="rounded-2xl p-12 sm:p-16 text-center"
            style={{ background: 'var(--db-surface)', border: '1px solid var(--db-border)' }}
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

        {/* ── Empty: tile-aware (tile active, no chip/search) ── */}
        {tileEmptyState && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--db-surface)', border: '1px solid var(--db-border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--db-elevated)' }}
            >
              <Filter className="w-5 h-5" style={{ color: 'var(--db-text-3)' }} />
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--db-text-2)' }}>
              {tileEmptyState.headline}
            </p>
            <p
              className="text-xs leading-relaxed max-w-xs mx-auto"
              style={{ color: 'var(--db-text-3)' }}
            >
              {tileEmptyState.sub}
            </p>
          </div>
        )}

        {/* ── Empty: filter/search/chip returns zero ─────────── */}
        {!loading && !error && leads.length > 0 && visibleLeads.length === 0 && !tileEmptyState && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--db-surface)', border: '1px solid var(--db-border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--db-elevated)' }}
            >
              <Filter className="w-5 h-5" style={{ color: 'var(--db-text-3)' }} />
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--db-text-2)' }}>
              No leads match
            </p>
            <p
              className="text-xs leading-relaxed max-w-xs mx-auto mb-4"
              style={{ color: 'var(--db-text-3)' }}
            >
              Try adjusting your search or filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="db-btn-ghost text-xs px-3 py-1.5 rounded-lg"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Lead list ──────────────────────────────────────── */}
        {!loading && !error && visibleLeads.length > 0 && (
          <div className="space-y-3">
            {visibleLeads.map((lead, i) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={i}
                onClick={setSelectedLead}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Lead detail drawer ─────────────────────────────── */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        adminName={adminName}
      />
    </>
  );
}
