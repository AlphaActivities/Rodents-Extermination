import React from 'react';
import { Inbox, Zap, Hammer, PhoneMissed } from 'lucide-react';
import StatCard, { FilterKey } from './StatCard';
import { Lead } from '../leads/LeadCard';

interface Stats {
  total: number;
  newLeads: number;
  activeJobs: number;
  checkIn: number;
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
  zeroText: string;
}> = [
  {
    id: 'all',
    label: 'Inbox',
    stat: 'total',
    icon: Inbox,
    accentColor: '#5ea8fb',
    accentSoft: 'rgba(94,168,251,0.14)',
    helpText: 'All open leads · not closed',
    zeroText: 'Inbox clear',
  },
  {
    id: 'new_leads',
    label: 'Fresh Leads',
    stat: 'newLeads',
    icon: Zap,
    accentColor: '#f97316',
    accentSoft: 'rgba(249,115,22,0.14)',
    helpText: 'Not yet contacted',
    zeroText: 'All leads contacted',
  },
  {
    id: 'active_jobs',
    label: 'Active Jobs',
    stat: 'activeJobs',
    icon: Hammer,
    accentColor: '#60a5fa',
    accentSoft: 'rgba(96,165,250,0.14)',
    helpText: 'Called · inspection or quote pending',
    zeroText: 'No jobs in progress',
  },
  {
    id: 'check_in',
    label: 'Check In',
    stat: 'checkIn',
    icon: PhoneMissed,
    accentColor: '#ef4444',
    accentSoft: 'rgba(239,68,68,0.14)',
    helpText: 'Quote delivered · awaiting decision',
    zeroText: 'No quotes pending',
  },
];

export function computeStats(leads: Lead[]): Stats {
  return {
    total: leads.filter((l) => !['closed', 'archived'].includes(l.status)).length,
    newLeads: leads.filter((l) => l.status === 'new').length,
    activeJobs: leads.filter((l) => l.status === 'contacted').length,
    checkIn: leads.filter((l) => l.status === 'quoted').length,
  };
}

export function applyFilter(leads: Lead[], filter: FilterKey): Lead[] {
  switch (filter) {
    case 'new_leads':
      return leads.filter((l) => l.status === 'new');
    case 'active_jobs':
      return leads.filter((l) => l.status === 'contacted');
    case 'check_in':
      return leads.filter((l) => l.status === 'quoted');
    case 'all':
    default:
      return leads.filter((l) => !['closed', 'archived'].includes(l.status));
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
          zeroText={card.zeroText}
          active={activeFilter === card.id}
          onClick={onFilterChange}
          loading={loading}
        />
      ))}
    </div>
  );
}
