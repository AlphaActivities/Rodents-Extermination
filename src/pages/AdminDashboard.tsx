import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, RefreshCw, Users, Phone, Mail, Wrench, MessageSquare, Globe, Calendar } from 'lucide-react';

interface Lead {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  service_name: string | null;
  message: string | null;
  landing_page: string | null;
  page_path: string | null;
  referrer: string | null;
}

interface Props {
  onSignOut: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function LeadCard({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Card header */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-neutral-900 text-base truncate">{lead.name}</span>
              {lead.service_name && (
                <span className="flex-shrink-0 text-xs font-medium bg-brand-50 text-brand-600 border border-brand-100 px-2.5 py-0.5 rounded-full">
                  {lead.service_name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatDate(lead.created_at)}
            </div>
          </div>
        </div>

        {/* Primary contact row */}
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={`tel:${lead.phone.replace(/\D/g, '')}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            {lead.phone}
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors truncate"
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              {lead.email}
            </a>
          )}
        </div>

        {/* Message preview */}
        {lead.message && (
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-2">
            {lead.message}
          </p>
        )}
      </div>

      {/* Expandable metadata */}
      <div className="border-t border-neutral-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-3 text-xs font-medium text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors min-h-[0px]"
        >
          <span>Source details</span>
          <span className="text-neutral-300">{expanded ? '▲' : '▼'}</span>
        </button>

        {expanded && (
          <div className="px-5 sm:px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-500">
            {lead.service_name && (
              <div className="flex items-start gap-2">
                <Wrench className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-400" />
                <div>
                  <div className="font-medium text-neutral-600 mb-0.5">Service</div>
                  <div>{lead.service_name}</div>
                </div>
              </div>
            )}
            {lead.message && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-400" />
                <div>
                  <div className="font-medium text-neutral-600 mb-0.5">Full message</div>
                  <div className="leading-relaxed">{lead.message}</div>
                </div>
              </div>
            )}
            {lead.landing_page && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-400" />
                <div>
                  <div className="font-medium text-neutral-600 mb-0.5">Landing page</div>
                  <div className="break-all">{lead.landing_page}</div>
                </div>
              </div>
            )}
            {lead.referrer && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-400" />
                <div>
                  <div className="font-medium text-neutral-600 mb-0.5">Referrer</div>
                  <div className="break-all">{lead.referrer}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ onSignOut }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const fetchLeads = async () => {
    setLoadingLeads(true);
    setFetchError(null);

    const { data, error } = await supabase
      .from('leads')
      .select('id, created_at, name, phone, email, service_name, message, landing_page, page_path, referrer')
      .order('created_at', { ascending: false });

    if (error) {
      setFetchError('Failed to load leads. Please try again.');
    } else {
      setLeads(data ?? []);
    }
    setLoadingLeads(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '');
    });
    fetchLeads();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top nav */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-neutral-900 text-sm">Lead Dashboard</span>
              <span className="hidden sm:inline text-neutral-400 text-xs ml-2">Rodents Exterm &amp; Insulation</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden sm:block text-xs text-neutral-400 truncate max-w-[180px]">{userEmail}</span>
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 px-3 py-2 rounded-lg transition-all duration-150 min-h-[0px] disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {loadingLeads ? 'Loading...' : `${leads.length} Lead${leads.length !== 1 ? 's' : ''}`}
            </h2>
            <p className="text-sm text-neutral-500">Newest submissions first</p>
          </div>
          <button
            onClick={fetchLeads}
            disabled={loadingLeads}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 px-3 py-2 rounded-lg transition-all duration-150 min-h-[0px] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error state */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center mb-6">
            <p className="text-red-600 text-sm font-medium">{fetchError}</p>
            <button
              onClick={fetchLeads}
              className="mt-3 text-sm text-red-500 hover:text-red-700 font-medium transition-colors min-h-[0px]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingLeads && !fetchError && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse">
                <div className="h-4 bg-neutral-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-neutral-100 rounded w-1/4 mb-4" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingLeads && !fetchError && leads.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium">No leads yet</p>
            <p className="text-neutral-400 text-sm mt-1">Submissions from the contact form will appear here.</p>
          </div>
        )}

        {/* Lead cards */}
        {!loadingLeads && !fetchError && leads.length > 0 && (
          <div className="space-y-4">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
