import { useState } from 'react';
import { Phone, Mail, Wrench, MessageSquare, Globe, Calendar } from 'lucide-react';

export interface Lead {
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  lead: Lead;
}

export default function LeadCard({ lead }: Props) {
  const [expanded, setExpanded] = useState(false);
  const ageHours = (Date.now() - new Date(lead.created_at).getTime()) / 3600000;

  return (
    <div className="db-card overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Name row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {/* Urgency dot */}
              {ageHours > 24 ? (
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ background: 'var(--db-error)' }}
                  title="No contact in 24+ hours"
                />
              ) : ageHours > 4 ? (
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ background: 'var(--db-warning)' }}
                  title="No contact in 4+ hours"
                />
              ) : null}

              <span
                className="font-semibold text-sm truncate"
                style={{ color: 'var(--db-text-1)' }}
              >
                {lead.name}
              </span>

              {lead.service_name && (
                <span className="db-badge shrink-0 text-xs">{lead.service_name}</span>
              )}
            </div>

            {/* Timestamp */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--db-text-3)' }}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{formatDate(lead.created_at)}</span>
              <span style={{ color: 'var(--db-border-hi)' }}>·</span>
              <span>{timeAgo(lead.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`tel:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            {lead.phone}
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="db-action-btn-secondary"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[180px]">{lead.email}</span>
            </a>
          )}
        </div>

        {/* Message preview */}
        {lead.message && (
          <p
            className="mt-3 text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--db-text-2)' }}
          >
            {lead.message}
          </p>
        )}
      </div>

      {/* Expandable source details */}
      <div style={{ borderTop: '1px solid var(--db-border)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs font-medium transition-colors duration-150 db-expand-btn"
        >
          <span>Source details</span>
          <span style={{ color: 'var(--db-text-3)' }}>{expanded ? '▲' : '▼'}</span>
        </button>

        {expanded && (
          <div className="px-4 sm:px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {lead.service_name && (
              <div className="flex items-start gap-2">
                <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
                <div>
                  <div className="font-medium mb-0.5" style={{ color: 'var(--db-text-2)' }}>Service</div>
                  <div style={{ color: 'var(--db-text-3)' }}>{lead.service_name}</div>
                </div>
              </div>
            )}
            {lead.message && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
                <div>
                  <div className="font-medium mb-0.5" style={{ color: 'var(--db-text-2)' }}>Full message</div>
                  <div className="leading-relaxed" style={{ color: 'var(--db-text-3)' }}>{lead.message}</div>
                </div>
              </div>
            )}
            {lead.landing_page && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
                <div>
                  <div className="font-medium mb-0.5" style={{ color: 'var(--db-text-2)' }}>Landing page</div>
                  <div className="break-all" style={{ color: 'var(--db-text-3)' }}>{lead.landing_page}</div>
                </div>
              </div>
            )}
            {lead.referrer && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
                <div>
                  <div className="font-medium mb-0.5" style={{ color: 'var(--db-text-2)' }}>Referrer</div>
                  <div className="break-all" style={{ color: 'var(--db-text-3)' }}>{lead.referrer}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
