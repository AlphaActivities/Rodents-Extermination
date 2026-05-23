import React from 'react';

export type FilterKey = 'all' | 'today' | 'pipeline' | 'follow_up';

interface StatCardProps {
  id: FilterKey;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  accentSoft: string;
  helpText: string;
  active: boolean;
  onClick: (id: FilterKey) => void;
  loading?: boolean;
}

export default function StatCard({
  id,
  label,
  value,
  icon: Icon,
  accentColor,
  accentSoft,
  helpText,
  active,
  onClick,
  loading,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="db-stat-card"
      data-active={active ? 'true' : undefined}
      style={
        active
          ? {
              borderColor: accentColor,
              boxShadow: `0 0 0 1px ${accentColor}, 0 4px 20px ${accentSoft}`,
              ['--db-tile-accent' as string]: accentColor,
              ['--db-tile-accent-soft' as string]: accentSoft,
            }
          : {
              ['--db-tile-accent' as string]: accentColor,
              ['--db-tile-accent-soft' as string]: accentSoft,
            }
      }
    >
      {/* Icon pill */}
      <div
        className="db-stat-icon"
        style={{
          background: active ? accentSoft : undefined,
          color: active ? accentColor : undefined,
        }}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Metric */}
      <div className="mt-3 mb-1">
        {loading ? (
          <div
            className="h-7 w-12 rounded-md animate-pulse"
            style={{ background: 'var(--db-elevated)' }}
          />
        ) : (
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: active ? accentColor : 'var(--db-text-1)' }}
          >
            {value}
          </span>
        )}
      </div>

      {/* Label */}
      <div
        className="text-xs font-semibold uppercase tracking-wider mb-0.5"
        style={{ color: active ? accentColor : 'var(--db-text-2)' }}
      >
        {label}
      </div>

      {/* Help text */}
      <div
        className="text-xs leading-snug"
        style={{ color: 'var(--db-text-3)' }}
      >
        {helpText}
      </div>

      {/* Active indicator bar */}
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl"
          style={{ background: accentColor }}
        />
      )}
    </button>
  );
}
