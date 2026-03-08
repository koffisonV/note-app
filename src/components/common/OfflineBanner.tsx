import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { FaWifi } from 'react-icons/fa6';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-500 px-4 py-2 text-sm font-medium text-white"
    >
      <FaWifi className="h-4 w-4" />
      You are offline. Changes cannot be saved.
    </div>
  );
}
