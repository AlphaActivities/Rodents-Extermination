import { Phone, Mail, MessageSquare as Sms, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getUrgency } from '../components/urgency';

export type LeadStatus = 'new' | 'contacted' | 'inspection_scheduled' | 'quoted' | 'won' | 'lost' | 'closed' | 'archived';

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
  status: LeadStatus;
  property_zip?: string | null;
  normalized_phone?: string | null;
  quality?: string;
  spam_score?: number;
  spam_reasons?: string[];
  duplicate_of?: string | null;
  last_contacted_at?: string | null;
  follow_up_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  service_area_status?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
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

function UrgencyPip({ lead }: { lead: Lead }) {
  const urgency = getUrgency(lead);
  const isUrgent = urgency.show;
  return (
    <span
      className={['shrink-0 inline-block w-2 h-2 rounded-full', isUrgent ? 'animate-pulse' : ''].join(' ')}
      style={{ background: urgency.pipColor }}
      title={urgency.label || lead.status}
    />
  );
}

interface Props {
  lead: Lead;
  index: number;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, index, onClick }: Props) {
  return (
    <article
      className="db-card db-lead-card overflow-hidden cursor-pointer"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'backwards',
        '--sheen-delay': `${index * 0.75}s`,
      } as React.CSSProperties}
      onClick={() => onClick(lead)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(lead);
        }
      }}
      aria-label={`View details for ${lead.name}`}
    >
      <div className="p-4 sm:p-5">

        {/* Row 1: urgency pip + name + service badge + status badge */}
        <div className="flex items-center gap-2 flex-wrap min-w-0 mb-2.5">
          <UrgencyPip lead={lead} />
          <span
            className="font-semibold text-sm leading-tight truncate"
            style={{ color: 'var(--db-text-1)' }}
          >
            {lead.name}
          </span>
          {lead.service_name && (
            <span className="db-badge shrink-0">{lead.service_name}</span>
          )}
          <StatusBadge status={lead.status} />
        </div>

        {/* Row 2: timestamp */}
        <div
          className="flex items-center gap-1.5 text-xs mb-3.5"
          style={{ color: 'var(--db-text-3)' }}
        >
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatDate(lead.created_at)}</span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{
              background: 'var(--db-elevated)',
              color: 'var(--db-text-2)',
            }}
          >
            {timeAgo(lead.created_at)}
          </span>
        </div>

        {/* Row 3: contact quick actions — stopPropagation on each link individually
            so empty space around buttons reaches the article onClick and opens the drawer. */}
        <div className="flex flex-wrap gap-2 mb-3 w-fit">
          {/* Call — primary, most prominent */}
          <a
            href={`tel:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn"
            aria-label={`Call ${lead.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{lead.phone}</span>
          </a>
          {/* Text */}
          <a
            href={`sms:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn-secondary"
            aria-label={`Text ${lead.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Sms className="w-3.5 h-3.5 shrink-0" />
            <span>Text</span>
          </a>
          {/* Email — only shown when email exists */}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="db-action-btn-secondary"
              aria-label={`Email ${lead.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[160px]">{lead.email}</span>
            </a>
          )}
        </div>

      </div>

      {/* View details strip — full-width bottom bar so it's obvious and tappable */}
      <div
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs font-semibold"
        style={{
          borderTop: '1px solid var(--db-border)',
          color: 'var(--db-accent-text)',
          background: 'var(--db-accent-soft)',
        }}
      >
        <span>View details</span>
        <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>→</span>
      </div>
    </article>
  );
}
