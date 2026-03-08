import { Sidebar } from '@/components/Sidebar/Sidebar';
import { NoteEditor } from '@/components/NoteEditor/NoteEditor';
import { RightPanel } from '@/components/RightPanel/RightPanel';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DashboardLayout() {
  const isOnline = useOnlineStatus();

  return (
    <div className={`flex h-screen flex-col bg-white ${!isOnline ? 'pt-9' : ''}`}>
      <OfflineBanner />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar />
        <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <NoteEditor />
          <RightPanel />
        </main>
      </div>
    </div>
  );
}
