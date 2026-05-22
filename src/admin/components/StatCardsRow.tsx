import { Users, CalendarDays, Thermometer, Bell } from 'lucide-react';
import StatCard, { FilterKey } from './StatCard';
import { Lead } from '../leads/LeadCard';

interface Stats {
  total: number;
  today: number;
  insulation: number;
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
    label: 'Total Leads',
    stat: 'total',
    icon: Users,
    accentColor: 'var(--db-accent-text)',
    accentSoft: 'var(--db-accent-soft)',
    helpText: 'All time submissions',
  },
  {
    id: 'today',
    label: 'Today',
    stat: 'today',
    icon: CalendarDays,
    accentColor: '#34d399',
    accentSoft: 'rgba(52,211,153,0.14)',
    helpText: 'Received today',
  },
  {
    id: 'insulation',
    label: 'Insulation',
    stat: 'insulation',
    icon: Thermometer,
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245,158,11,0.14)',
    helpText: 'Insulation service leads',
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

export function computeStats(leads: Lead[]): Stats {
  const now = Date.now();
  const today = new Date();

  return {
    total: leads.length,
    today: leads.filter((l) => {
      const d = new Date(l.created_at);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }).length,
    insulation: leads.filter((l) =>
      l.service_name?.toLowerCase().includes('insulation')
    ).length,
    // Needs follow-up: status is still 'new' AND older than 4 hours
    followUp: leads.filter(
      (l) =>
        l.status === 'new' &&
        (now - new Date(l.created_at).getTime()) / 3600000 > 4
    ).length,
  };
}

export function applyFilter(leads: Lead[], filter: FilterKey): Lead[] {
  const now = Date.now();
  const today = new Date();

  switch (filter) {
    case 'today':
      return leads.filter((l) => {
        const d = new Date(l.created_at);
        return (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        );
      });
    case 'insulation':
      return leads.filter((l) =>
        l.service_name?.toLowerCase().includes('insulation')
      );
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
