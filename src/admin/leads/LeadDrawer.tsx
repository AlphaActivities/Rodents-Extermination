import { useEffect, useRef, useState, useCallback } from 'react';
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
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Lead, LeadStatus } from './LeadCard';
import StatusBadge, { STATUS_CONFIG } from '../components/StatusBadge';
import { getUrgency } from '../components/urgency';
import { supabase } from '../../lib/supabase';

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

// ── next best action ─────────────────────────────────────────

interface NextAction {
  text: string;
  color: string;
  bg: string;
  border: string;
}

function getNextAction(lead: Lead): NextAction {
  const hrs = (Date.now() - new Date(lead.created_at).getTime()) / 3600000;

  switch (lead.status) {
    case 'new':
      if (hrs > 24)
        return {
          text: 'Urgent follow-up — call now',
          color: 'var(--db-error)',
          bg: 'rgba(239,68,68,0.08)',
          border: 'rgba(239,68,68,0.2)',
        };
      if (hrs > 4)
        return {
          text: 'Follow up now — call or text',
          color: 'var(--db-warning)',
          bg: 'rgba(245,158,11,0.08)',
          border: 'rgba(245,158,11,0.2)',
        };
      return {
        text: 'Call soon — fresh lead',
        color: 'var(--db-success)',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
      };
    case 'contacted':
      return {
        text: 'Send quote / follow up',
        color: '#fbbf24',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.18)',
      };
    case 'quoted':
      return {
        text: 'Check quote outcome',
        color: '#60a5fa',
        bg: 'rgba(37,99,235,0.08)',
        border: 'rgba(37,99,235,0.18)',
      };
    case 'closed':
      return {
        text: 'Job completed / won',
        color: 'var(--db-success)',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.18)',
      };
    case 'archived':
      return {
        text: 'No active action needed',
        color: 'var(--db-text-3)',
        bg: 'transparent',
        border: 'var(--db-border)',
      };
  }
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
    <div
      className="flex items-start gap-3 py-2.5"
      style={{ borderBottom: '1px solid var(--db-border)' }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--db-text-3)' }} />
      <div className="min-w-0 flex-1">
        <div className="text-xs mb-0.5" style={{ color: 'var(--db-text-3)' }}>
          {label}
        </div>
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

// ── status selector ──────────────────────────────────────────

const STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'quoted', 'closed', 'archived'];

interface StatusSelectorProps {
  current: LeadStatus;
  saving: boolean;
  saveError: string | null;
  onChange: (s: LeadStatus) => void;
}

function StatusSelector({ current, saving, saveError, onChange }: StatusSelectorProps) {
  return (
    <div>
      <SectionLabel>Status</SectionLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {STATUS_ORDER.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const active = current === s;
          return (
            <button
              key={s}
              type="button"
              disabled={saving}
              onClick={() => !active && onChange(s)}
              className="db-status-option"
              data-active={active ? 'true' : undefined}
              style={
                active
                  ? { color: cfg.color, background: cfg.bg, borderColor: cfg.border }
                  : undefined
              }
              aria-pressed={active}
            >
              {saving && active ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: active ? cfg.color : 'var(--db-text-3)' }}
                />
              )}
              {cfg.label}
            </button>
          );
        })}
      </div>
      {saveError && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--db-error)' }}>
          {saveError}
        </p>
      )}
    </div>
  );
}

// ── main component ───────────────────────────────────────────

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
}

export default function LeadDrawer({ lead, onClose, onStatusChange }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const isOpen = lead !== null;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSaveError(null);
    setSaving(false);
  }, [lead?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleStatusChange = useCallback(
    async (newStatus: LeadStatus) => {
      if (!lead) return;
      setSaving(true);
      setSaveError(null);

      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) {
        setSaveError('Failed to save. Please try again.');
      } else {
        onStatusChange(lead.id, newStatus);
      }
      setSaving(false);
    },
    [lead, onStatusChange]
  );

  const urgency = lead ? getUrgency(lead) : null;
  const nextAction = lead ? getNextAction(lead) : null;

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
            {/* ── Drag handle (mobile only) ──────────────── */}
            <div className="db-drawer-handle-row" aria-hidden="true">
              <div className="db-drawer-handle" />
            </div>

            {/* ── Header ────────────────────────────────── */}
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
                  <div className="flex items-center flex-wrap gap-2 mt-1.5">
                    {lead.service_name && (
                      <span className="db-badge">{lead.service_name}</span>
                    )}
                    <StatusBadge status={lead.status} size="md" />
                  </div>
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
                {urgency?.show && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: urgency.textColor }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {urgency.label}
                  </div>
                )}
                {!urgency?.show && lead.status !== 'new' && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: 'var(--db-success)' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In progress
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
                    style={{
                      background: 'var(--db-surface)',
                      color: 'var(--db-text-2)',
                    }}
                  >
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
              </div>

              {/* Quick actions — stop propagation prevents card click bleed */}
              <div
                className="flex flex-wrap gap-2 mt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`tel:${lead.phone.replace(/\D/g, '')}`}
                  className="db-action-btn"
                  aria-label={`Call ${lead.name}`}
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  Call {lead.phone}
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

            {/* ── Scrollable body ───────────────────────── */}
            <div className="db-drawer-body">

              {/* Next best action banner */}
              {nextAction && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm font-medium"
                  style={{
                    color: nextAction.color,
                    background: nextAction.bg,
                    border: `1px solid ${nextAction.border}`,
                  }}
                >
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  {nextAction.text}
                </div>
              )}

              {/* Status selector */}
              <div className="mb-6">
                <StatusSelector
                  current={lead.status}
                  saving={saving}
                  saveError={saveError}
                  onChange={handleStatusChange}
                />
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
                      background: 'var(--db-surface)',
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
                    <DetailRow
                      icon={Globe}
                      label="Landing page"
                      value={lead.landing_page}
                      breakAll
                    />
                  )}
                  {lead.page_path && (
                    <DetailRow
                      icon={Globe}
                      label="Page path"
                      value={lead.page_path}
                      breakAll
                    />
                  )}
                  {lead.referrer && (
                    <DetailRow
                      icon={Globe}
                      label="Referrer"
                      value={lead.referrer}
                      breakAll
                    />
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
