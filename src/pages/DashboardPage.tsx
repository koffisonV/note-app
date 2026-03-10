import { useEffect, useRef } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Spinner } from '@/components/common/Spinner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DashboardPage() {
  const loadNotes = useNoteStore((s) => s.loadNotes);
  const flushPendingChanges = useNoteStore((s) => s.flushPendingChanges);
  const isLoading = useNoteStore((s) => s.isLoading);
  const notes = useNoteStore((s) => s.notes);
  const isOnline = useOnlineStatus();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!isOnline) return;

    const sync = async () => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await flushPendingChanges();
        await loadNotes();
      } else {
        await flushPendingChanges();
      }
    };

    sync();
  }, [isOnline, loadNotes, flushPendingChanges]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isOnline && notes.length === 0) {
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
