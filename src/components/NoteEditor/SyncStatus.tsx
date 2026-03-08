import type { SyncState } from '@/types/note';
import { FaCheck, FaSpinner, FaTriangleExclamation } from 'react-icons/fa6';

interface SyncStatusProps {
  status: SyncState;
}

const config: Record<SyncState, { label: string; icon: React.ReactNode; className: string }> = {
  idle: {
    label: '',
    icon: null,
    className: '',
  },
  saving: {
    label: 'Saving...',
    icon: <FaSpinner className="h-3 w-3 animate-spin" />,
    className: 'text-amber-600',
  },
  saved: {
    label: 'Saved',
    icon: <FaCheck className="h-3 w-3" />,
    className: 'text-green-600',
  },
  error: {
    label: 'Error',
    icon: <FaTriangleExclamation className="h-3 w-3" />,
    className: 'text-red-500',
  },
};

export function SyncStatus({ status }: SyncStatusProps) {
  const { label, icon, className } = config[status];

  if (status === 'idle') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}
      aria-live="polite"
    >
      {icon}
      {label}
    </span>
  );
}
