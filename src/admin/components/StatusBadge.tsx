import { LeadStatus } from '../leads/LeadCard';

interface Config {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_CONFIG: Record<LeadStatus, Config> = {
  new: {
    label: 'New',
    color: '#60a5fa',
    bg: 'rgba(37,99,235,0.15)',
    border: 'rgba(37,99,235,0.28)',
  },
  contacted: {
    label: 'Contacted',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.28)',
  },
  quoted: {
    label: 'Quoted',
    color: '#c084fc',
    bg: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.28)',
  },
  closed: {
    label: 'Closed',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.28)',
  },
  archived: {
    label: 'Archived',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    border: 'rgba(107,114,128,0.22)',
  },
};

interface Props {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold shrink-0',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
      ].join(' ')}
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}
