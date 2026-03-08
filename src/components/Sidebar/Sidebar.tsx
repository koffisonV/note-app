import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { TagList } from './TagList';
import {
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaNoteSticky,
} from 'react-icons/fa6';

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const selectedTag = useUIStore((s) => s.selectedTag);
  const setSelectedTag = useUIStore((s) => s.setSelectedTag);
  const { logout } = useAuth();
  const isOnline = useOnlineStatus();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-40 rounded-xl bg-white p-2 shadow-md lg:hidden"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? (
          <FaXmark className="h-5 w-5 text-gray-700" />
        ) : (
          <FaBars className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-gray-100 bg-white transition-transform duration-200 lg:relative lg:z-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-5">
          <FaNoteSticky className="h-6 w-6 text-indigo-500" />
          <span className="text-lg font-bold text-gray-900">NoteApp</span>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Active filter indicator */}
        {selectedTag && (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-1.5">
            <span className="text-xs font-medium text-indigo-600">
              Filtered: {selectedTag}
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className="text-indigo-400 hover:text-indigo-600"
              aria-label="Clear tag filter"
            >
              <FaXmark className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Tags */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <TagList />
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={logout}
            disabled={!isOnline}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <FaRightFromBracket className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
