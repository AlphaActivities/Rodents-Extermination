import { NavLink } from 'react-router-dom';
import { Users, BarChart2, Wrench, BookUser, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Leads',     to: '/admin/leads',     icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart2, disabled: true },
  { label: 'Jobs',      to: '/admin/jobs',       icon: Wrench,    disabled: true },
  { label: 'Customers', to: '/admin/customers',  icon: BookUser,  disabled: true },
  { label: 'Settings',  to: '/admin/settings',   icon: Settings2, disabled: true },
];

interface NavListProps {
  collapsed?: boolean;
  onNavigate: () => void;
}

function NavList({ collapsed, onNavigate }: NavListProps) {
  return (
    <ul className="space-y-0.5 px-2" role="list">
      {navItems.map(({ label, to, icon: Icon, disabled }) => (
        <li key={label}>
          {disabled ? (
            <div
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-default select-none"
              style={{ color: 'var(--db-text-3)' }}
              aria-disabled="true"
            >
              <Icon className="shrink-0 w-4 h-4" aria-hidden="true" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </div>
          ) : (
            <NavLink
              to={to}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-colors duration-150',
                  isActive ? 'db-sidebar-active' : 'db-sidebar-item',
                ].join(' ')
              }
              onClick={onNavigate}
            >
              <Icon className="shrink-0 w-4 h-4" aria-hidden="true" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
            </NavLink>
          )}
        </li>
      ))}
    </ul>
  );
}

function BrandMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 shrink-0"
      style={{ height: '64px', borderBottom: '1px solid var(--db-border)', overflow: 'hidden' }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-lg"
        style={{ width: '32px', height: '32px', background: '#ffffff' }}
        aria-hidden="true"
      >
        <img
          src="/logo/black_logo.PNG"
          alt=""
          className="object-contain"
          style={{ width: '80%', height: '80%' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--db-text-1)' }}>
            Rodents Exterm
          </div>
          <div className="text-xs leading-tight truncate" style={{ color: 'var(--db-text-3)' }}>
            Operations
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────── */}
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
        <aside
          className={['db-sidebar flex flex-col h-full transition-all duration-200', collapsed ? 'w-16' : 'w-60'].join(' ')}
          style={{ background: 'var(--db-sidebar)', borderRight: '1px solid var(--db-border)' }}
          aria-label="Main navigation"
        >
          <BrandMark collapsed={collapsed} />

          <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden" aria-label="Dashboard navigation">
            <NavList collapsed={collapsed} onNavigate={() => {}} />
          </nav>

          <div
            className="shrink-0 px-2 pb-4"
            style={{ borderTop: '1px solid var(--db-border)', paddingTop: '12px' }}
          >
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="db-sidebar-item w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-colors duration-150"
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                : (
                  <>
                    <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">Collapse</span>
                  </>
                )
              }
            </button>
          </div>
        </aside>
      </div>

      {/* ── Mobile overlay ───────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="absolute inset-0"
            style={{ background: 'var(--db-overlay)' }}
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div
            className="relative z-10 flex flex-col w-60 h-full"
            style={{ background: 'var(--db-sidebar)', borderRight: '1px solid var(--db-border)' }}
          >
            <BrandMark />
            <nav className="flex-1 py-4 overflow-y-auto" aria-label="Dashboard navigation">
              <NavList onNavigate={onCloseMobile} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
