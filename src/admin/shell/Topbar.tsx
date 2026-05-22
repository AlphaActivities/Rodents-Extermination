import { LogOut, Menu, RefreshCw } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  userEmail: string;
  onSignOut: () => void;
  onOpenMobileSidebar: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function Topbar({
  pageTitle,
  userEmail,
  onSignOut,
  onOpenMobileSidebar,
  onRefresh,
  refreshing,
}: TopbarProps) {
  return (
    <header
      className="db-topbar sticky top-0 z-40 flex items-center justify-between gap-4 px-4 sm:px-6 shrink-0"
      style={{
        height: '64px',
        background: 'var(--db-topbar)',
        borderBottom: '1px solid var(--db-border)',
      }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="db-icon-btn lg:hidden shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1
          className="text-base font-bold truncate"
          style={{ color: 'var(--db-text-1)' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Refresh — only shown when handler provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="db-icon-btn"
            aria-label={refreshing ? 'Refreshing…' : 'Refresh leads'}
            title="Refresh"
          >
            <RefreshCw className={['w-4 h-4', refreshing ? 'animate-spin' : ''].join(' ')} aria-hidden="true" />
          </button>
        )}

        {/* User email — hidden on mobile */}
        {userEmail && (
          <span
            className="hidden sm:block text-xs truncate max-w-[200px]"
            style={{ color: 'var(--db-text-3)' }}
          >
            {userEmail}
          </span>
        )}

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="db-btn-ghost flex items-center gap-1.5 text-sm font-medium"
          style={{ minHeight: '36px' }}
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
