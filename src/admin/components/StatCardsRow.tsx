import React from 'react';
import { Inbox, Sparkles, Activity, Bell } from 'lucide-react';
import StatCard, { FilterKey } from './StatCard';
import { Lead } from '../leads/LeadCard';

interface Stats {
  total: number;
  today: number;
  pipeline: number;
  followUp: number;
}

interface Props {
  stats: Stats;
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
  loading?: boolean;
}

const CARDS: Array<{
  id: FilterKey;
  label: string;
  stat: keyof Stats;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  accentSoft: string;
  helpText: string;
  zeroHelpText: string;
}> = [
  {
    id: 'all',
    label: 'Inbox',
    stat: 'total',
    icon: Inbox,
    accentColor: 'var(--db-accent-text)',
    accentSoft: 'var(--db-accent-soft)',
    helpText: 'All open leads · not closed',
    zeroHelpText: 'Inbox clear',
  },
  {
    id: 'today',
    label: 'Fresh Leads',
    stat: 'today',
    icon: Sparkles,
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.14)',
    helpText: 'Not yet contacted',
    zeroHelpText: 'All leads contacted',
  },
  {
    id: 'pipeline',
    label: 'Active Jobs',
    stat: 'pipeline',
    icon: Activity,
    accentColor: '#34d399',
    accentSoft: 'rgba(52,211,153,0.14)',
    helpText: 'Called · inspection or quote pending',
    zeroHelpText: 'No jobs in progress',
  },
  {
    id: 'follow_up',
    label: 'Check In',
    stat: 'followUp',
    icon: Bell,
    accentColor: '#ef4444',
    accentSoft: 'rgba(239,68,68,0.14)',
    helpText: 'Quote delivered · awaiting decision',
    zeroHelpText: 'No quotes pending',
  },
];

export function computeStats(leads: Lead[]): Stats {
  return {
    total: leads.filter((l) => l.status !== 'closed' && l.status !== 'archived').length,
    today: leads.filter((l) => l.status === 'new').length,
    pipeline: leads.filter((l) => l.status === 'contacted').length,
    followUp: leads.filter((l) => l.status === 'quoted').length,
  };
}

export function applyFilter(leads: Lead[], filter: FilterKey): Lead[] {
  switch (filter) {
    case 'today':
      return leads.filter((l) => l.status === 'new');
    case 'pipeline':
      return leads.filter((l) => l.status === 'contacted');
    case 'follow_up':
      return leads.filter((l) => l.status === 'quoted');
    case 'all':
    default:
      return leads.filter((l) => l.status !== 'closed' && l.status !== 'archived');
  }
}

export default function StatCardsRow({
  stats,
  activeFilter,
  onFilterChange,
  loading,
}: Props) {
  return (
    <div className="db-stat-cards-row">
      {CARDS.map((card) => (
        <StatCard
          key={card.id}
          id={card.id}
          label={card.label}
          value={stats[card.stat]}
          icon={card.icon}
          accentColor={card.accentColor}
          accentSoft={card.accentSoft}
          helpText={card.helpText}
          zeroHelpText={card.zeroHelpText}
          active={activeFilter === card.id}
          onClick={onFilterChange}
          loading={loading}
        />
      ))}
    </div>
  );
}
