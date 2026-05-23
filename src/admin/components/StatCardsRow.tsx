import React from 'react';
import { Users, CalendarDays, Activity, Bell } from 'lucide-react';
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
}> = [
  {
    id: 'all',
    label: 'Active Leads',
    stat: 'total',
    icon: Users,
    accentColor: 'var(--db-accent-text)',
    accentSoft: 'var(--db-accent-soft)',
    helpText: 'All non-archived leads',
  },
  {
    id: 'today',
    label: 'New Today',
    stat: 'today',
    icon: CalendarDays,
    accentColor: '#34d399',
    accentSoft: 'rgba(52,211,153,0.14)',
    helpText: 'Received today (CT)',
  },
  {
    id: 'pipeline',
    label: 'Open Pipeline',
    stat: 'pipeline',
    icon: Activity,
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.14)',
    helpText: 'Active · not closed',
  },
  {
    id: 'follow_up',
    label: 'Follow-Up',
    stat: 'followUp',
    icon: Bell,
    accentColor: '#ef4444',
    accentSoft: 'rgba(239,68,68,0.14)',
    helpText: 'New · no contact 4+ hrs',
  },
];

const CT_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function isTodayCentral(iso: string): boolean {
  return CT_FMT.format(new Date(iso)) === CT_FMT.format(new Date());
}

export function computeStats(leads: Lead[]): Stats {
  const now = Date.now();

  return {
    total: leads.length,
    today: leads.filter((l) => isTodayCentral(l.created_at)).length,
    pipeline: leads.filter((l) => !['closed', 'archived'].includes(l.status)).length,
    followUp: leads.filter(
      (l) =>
        l.status === 'new' &&
        (now - new Date(l.created_at).getTime()) / 3600000 > 4
    ).length,
  };
}

export function applyFilter(leads: Lead[], filter: FilterKey): Lead[] {
  const now = Date.now();

  switch (filter) {
    case 'today':
      return leads.filter((l) => isTodayCentral(l.created_at));
    case 'pipeline':
      return leads.filter((l) => !['closed', 'archived'].includes(l.status));
    case 'follow_up':
      return leads.filter(
        (l) =>
          l.status === 'new' &&
          (now - new Date(l.created_at).getTime()) / 3600000 > 4
      );
    case 'all':
    default:
      return leads;
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
          active={activeFilter === card.id}
          onClick={onFilterChange}
          loading={loading}
        />
      ))}
    </div>
  );
}
