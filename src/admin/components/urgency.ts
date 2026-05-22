import { Lead } from '../leads/LeadCard';

export interface UrgencyInfo {
  label: string;
  pipColor: string;
  textColor: string;
  show: boolean;
}

function fmtElapsed(hrs: number): string {
  const h = Math.floor(hrs);
  const m = Math.floor((hrs - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getUrgency(lead: Lead): UrgencyInfo {
  if (lead.status !== 'new') {
    return {
      label: '',
      pipColor: 'var(--db-text-3)',
      textColor: 'var(--db-text-3)',
      show: false,
    };
  }

  const hrs = (Date.now() - new Date(lead.created_at).getTime()) / 3600000;
  const elapsed = fmtElapsed(hrs);

  if (hrs > 24) {
    return {
      label: `No contact in ${elapsed}`,
      pipColor: 'var(--db-error)',
      textColor: 'var(--db-error)',
      show: true,
    };
  }
  if (hrs > 4) {
    return {
      label: `No contact in ${elapsed}`,
      pipColor: 'var(--db-warning)',
      textColor: 'var(--db-warning)',
      show: true,
    };
  }
  return {
    label: 'Recent lead',
    pipColor: 'var(--db-success)',
    textColor: 'var(--db-success)',
    show: false,
  };
}
