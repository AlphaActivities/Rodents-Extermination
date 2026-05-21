import { useState } from 'react';
import { Phone, Mail, Wrench, MessageSquare, Globe, Clock } from 'lucide-react';

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

function UrgencyPip({ createdAt }: { createdAt: string }) {
  const hrs = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (hrs > 24) {
    return (
      <span
        className="shrink-0 inline-block w-2 h-2 rounded-full"
        style={{ background: 'var(--db-error)' }}
        title="No contact in 24+ hours"
      />
    );
  }
  if (hrs > 4) {
    return (
      <span
        className="shrink-0 inline-block w-2 h-2 rounded-full"
        style={{ background: 'var(--db-warning)' }}
        title="No contact in 4+ hours"
      />
    );
  }
  return (
    <span
      className="shrink-0 inline-block w-2 h-2 rounded-full"
      style={{ background: 'var(--db-success)' }}
      title="Recent lead"
    />
  );
}

interface Props {
  lead: Lead;
  index: number;
}

export default function LeadCard({ lead, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasSourceDetails =
    !!(lead.service_name || lead.message || lead.landing_page || lead.referrer);

  return (
    <article
      className="db-card overflow-hidden"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {/* ── Card body ─────────────────────────────────────── */}
      <div className="p-4 sm:p-5">

        {/* Row 1: name + badge + urgency */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <UrgencyPip createdAt={lead.created_at} />
            <span
              className="font-semibold text-sm leading-tight truncate"
              style={{ color: 'var(--db-text-1)' }}
            >
              {lead.name}
            </span>
            {lead.service_name && (
              <span className="db-badge shrink-0">{lead.service_name}</span>
            )}
          </div>
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

        {/* Row 3: contact actions */}
        <div className="flex flex-wrap gap-2 mb-3">
          <a
            href={`tel:${lead.phone.replace(/\D/g, '')}`}
            className="db-action-btn"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{lead.phone}</span>
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="db-action-btn-secondary"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">{lead.email}</span>
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
      </div>

      {/* ── Source details toggle ──────────────────────────── */}
      {hasSourceDetails && (
        <div style={{ borderTop: '1px solid var(--db-border)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="db-expand-btn w-full flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs font-medium"
          >
            <span>Source details</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                color: 'var(--db-text-3)',
              }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {expanded && (
            <div
              className="px-4 sm:px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{
                background: 'var(--db-bg)',
                borderTop: '1px solid var(--db-border)',
              }}
            >
              {lead.service_name && (
                <SourceRow icon={Wrench} label="Service" value={lead.service_name} />
              )}
              {lead.message && (
                <SourceRow
                  icon={MessageSquare}
                  label="Full message"
                  value={lead.message}
                  wide
                />
              )}
              {lead.landing_page && (
                <SourceRow
                  icon={Globe}
                  label="Landing page"
                  value={lead.landing_page}
                  wide
                  breakAll
                />
              )}
              {lead.referrer && (
                <SourceRow
                  icon={Globe}
                  label="Referrer"
                  value={lead.referrer}
                  wide
                  breakAll
                />
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

interface SourceRowProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  wide?: boolean;
  breakAll?: boolean;
}

function SourceRow({ icon: Icon, label, value, wide, breakAll }: SourceRowProps) {
  return (
    <div className={['flex items-start gap-2 pt-3', wide ? 'sm:col-span-2' : ''].join(' ')}>
      <Icon
        className="w-3.5 h-3.5 mt-0.5 shrink-0"
        style={{ color: 'var(--db-text-3)' }}
      />
      <div className="min-w-0">
        <div
          className="text-xs font-semibold mb-0.5"
          style={{ color: 'var(--db-text-2)' }}
        >
          {label}
        </div>
        <div
          className={['text-xs leading-relaxed', breakAll ? 'break-all' : ''].join(' ')}
          style={{ color: 'var(--db-text-3)' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
