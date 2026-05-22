import { Lead } from '../leads/LeadCard';

export interface UrgencyInfo {
  label: string;
  pipColor: string;
  textColor: string;
  show: boolean;
}

export function getUrgency(lead: Lead): UrgencyInfo {
  // Only show urgency for leads that haven't been contacted yet
  if (lead.status !== 'new') {
    return {
      label: '',
      pipColor: 'var(--db-text-3)',
      textColor: 'var(--db-text-3)',
      show: false,
    };
  }

  const hrs = (Date.now() - new Date(lead.created_at).getTime()) / 3600000;

  if (hrs > 24) {
    return {
      label: 'No contact in 24+ hours',
      pipColor: 'var(--db-error)',
      textColor: 'var(--db-error)',
      show: true,
    };
  }
  if (hrs > 4) {
    return {
      label: 'No contact in 4+ hours',
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
