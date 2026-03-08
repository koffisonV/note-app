import { useEffect } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Spinner } from '@/components/common/Spinner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DashboardPage() {
  const loadNotes = useNoteStore((s) => s.loadNotes);
  const isLoading = useNoteStore((s) => s.isLoading);
  const error = useNoteStore((s) => s.error);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      loadNotes();
    }
  }, [loadNotes, isOnline]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !isOnline) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-medium text-gray-500">
          You are offline. Please connect to the internet to load your notes.
        </p>
      </div>
    );
  }

  return <DashboardLayout />;
}
