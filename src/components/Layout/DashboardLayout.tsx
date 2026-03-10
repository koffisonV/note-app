import { Sidebar } from '@/components/Sidebar/Sidebar';
import { NoteEditor } from '@/components/NoteEditor/NoteEditor';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DashboardLayout() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex h-dvh flex-col overflow-hidden bg-white ${!isOnline ? 'pt-9' : ''}`}>
      <OfflineBanner />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex min-h-0 flex-1 flex-col">
          <NoteEditor />
        </main>
      </div>
    </div>
  );
}
