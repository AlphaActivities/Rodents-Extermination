import { Phone, Mail, MessageSquare as Sms, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getUrgency } from '../components/urgency';

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'closed' | 'archived';

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
      }}
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

        {/* Row 3: contact quick actions — stopPropagation so clicking tel/sms/mailto
            does not open the drawer */}
        <div
          className="flex flex-wrap gap-2 mb-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Call — primary, most prominent */}
          <a
            href={`tel:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn"
            aria-label={`Call ${lead.name}`}
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{lead.phone}</span>
          </a>
          {/* Text */}
          <a
            href={`sms:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn-secondary"
            aria-label={`Text ${lead.name}`}
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
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[160px]">{lead.email}</span>
            </a>
          )}
        </div>

        {/* Row 4: message preview */}
        {lead.message && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: 'var(--db-text-2)' }}
          >
            {lead.message}
          </p>
        )}

        {/* View hint */}
        <div
          className="mt-3 text-xs font-medium"
          style={{ color: 'var(--db-text-3)' }}
        >
          Click to view details →
        </div>
      </div>
    </article>
  );
}
