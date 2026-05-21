import { useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare as Sms,
  Clock,
  Wrench,
  Globe,
  Hash,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Lead } from './LeadCard';

// ── helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
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

function urgencyLabel(iso: string): { label: string; color: string; icon: React.ReactNode } | null {
  const hrs = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (hrs > 24) {
    return {
      label: 'No contact in 24+ hours',
      color: 'var(--db-error)',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    };
  }
  if (hrs > 4) {
    return {
      label: 'No contact in 4+ hours',
      color: 'var(--db-warning)',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    };
  }
  return {
    label: 'Recent lead',
    color: 'var(--db-success)',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  };
}

// ── sub-components ───────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ color: 'var(--db-text-3)' }}
    >
      {children}
    </div>
  );
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  breakAll?: boolean;
}

function DetailRow({ icon: Icon, label, value, breakAll }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid var(--db-border)' }}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
      <div className="min-w-0 flex-1">
        <div className="text-xs mb-0.5" style={{ color: 'var(--db-text-3)' }}>{label}</div>
        <div
          className={['text-sm leading-relaxed', breakAll ? 'break-all' : ''].join(' ')}
          style={{ color: 'var(--db-text-2)' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDrawer({ lead, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isOpen = lead !== null;

  // Escape key close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const urgency = lead ? urgencyLabel(lead.created_at) : null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────── */}
      <div
        className="db-drawer-backdrop"
        data-open={isOpen ? 'true' : undefined}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ──────────────────────────────────── */}
      <div
        ref={drawerRef}
        className="db-drawer"
        data-open={isOpen ? 'true' : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={lead ? `Lead details for ${lead.name}` : 'Lead details'}
      >
        {lead && (
          <>
            {/* ── Drag handle (mobile only) ─────────────────── */}
            <div className="db-drawer-handle-row" aria-hidden="true">
              <div className="db-drawer-handle" />
            </div>

            {/* ── Header ───────────────────────────────────── */}
            <div
              className="db-drawer-header"
              style={{ borderBottom: '1px solid var(--db-border)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2
                    className="text-base font-bold leading-tight truncate"
                    style={{ color: 'var(--db-text-1)' }}
                  >
                    {lead.name}
                  </h2>
                  {lead.service_name && (
                    <span className="db-badge mt-1.5 inline-block">{lead.service_name}</span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="db-icon-btn shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Urgency + timestamp */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {urgency && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: urgency.color }}
                  >
                    {urgency.icon}
                    {urgency.label}
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--db-text-3)' }}
                >
                  <Clock className="w-3 h-3" />
                  {formatDate(lead.created_at)}
                  <span
                    className="px-1.5 py-0.5 rounded-md font-medium"
                    style={{ background: 'var(--db-elevated)', color: 'var(--db-text-2)' }}
                  >
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ───────────────────────────── */}
            <div className="db-drawer-body">

              {/* Quick actions */}
              <div className="mb-6">
                <SectionLabel>Quick Actions</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, '')}`}
                    className="db-action-btn"
                    aria-label={`Call ${lead.name}`}
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    Call
                  </a>
                  <a
                    href={`sms:${lead.phone.replace(/\D/g, '')}`}
                    className="db-action-btn-secondary"
                    aria-label={`Text ${lead.name}`}
                  >
                    <Sms className="w-4 h-4 shrink-0" />
                    Text
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="db-action-btn-secondary"
                      aria-label={`Email ${lead.name}`}
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      Email
                    </a>
                  )}
                </div>
              </div>

              {/* Contact details */}
              <div className="mb-6">
                <SectionLabel>Contact</SectionLabel>
                <DetailRow icon={Phone} label="Phone" value={lead.phone} />
                {lead.email && (
                  <DetailRow icon={Mail} label="Email" value={lead.email} breakAll />
                )}
              </div>

              {/* Service */}
              {lead.service_name && (
                <div className="mb-6">
                  <SectionLabel>Service Requested</SectionLabel>
                  <DetailRow icon={Wrench} label="Service" value={lead.service_name} />
                </div>
              )}

              {/* Message */}
              {lead.message && (
                <div className="mb-6">
                  <SectionLabel>Message</SectionLabel>
                  <div
                    className="text-sm leading-relaxed p-3.5 rounded-xl"
                    style={{
                      background: 'var(--db-elevated)',
                      color: 'var(--db-text-2)',
                      border: '1px solid var(--db-border)',
                    }}
                  >
                    {lead.message}
                  </div>
                </div>
              )}

              {/* Source details */}
              {(lead.landing_page || lead.page_path || lead.referrer || lead.id) && (
                <div className="mb-6">
                  <SectionLabel>Source Details</SectionLabel>
                  {lead.landing_page && (
                    <DetailRow icon={Globe} label="Landing page" value={lead.landing_page} breakAll />
                  )}
                  {lead.page_path && (
                    <DetailRow icon={Globe} label="Page path" value={lead.page_path} breakAll />
                  )}
                  {lead.referrer && (
                    <DetailRow icon={Globe} label="Referrer" value={lead.referrer} breakAll />
                  )}
                  <DetailRow icon={Hash} label="Lead ID" value={String(lead.id)} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
