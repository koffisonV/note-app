import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useNoteStore } from '@/store/noteStore';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { TagList } from './TagList';
import { NoteCard } from '@/components/NoteCard/NoteCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaCircleUser,
} from 'react-icons/fa6';

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const selectedTag = useUIStore((s) => s.selectedTag);
  const setSelectedTag = useUIStore((s) => s.setSelectedTag);
  const { logout, user } = useAuth();
  const isOnline = useOnlineStatus();

  const getFilteredNotes = useNoteStore((s) => s.getFilteredNotes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);

  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const notes = getFilteredNotes(searchQuery, selectedTag);

  function handleDelete() {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  }

  function handleSelectNote(noteId: string) {
    setActiveNote(noteId);
    if (window.innerWidth < 768) {
      useUIStore.getState().setSidebarOpen(false);
    }
  }

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white p-2 shadow-md md:hidden"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? (
          <FaXmark className="h-5 w-5 text-gray-700" />
        ) : (
          <FaBars className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-gray-100 bg-white transition-transform duration-200 md:relative md:z-0 md:w-80 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 py-4 pl-14 pr-5 md:px-5">
          <img
            src="/notes-app-logo.png"
            alt="NoteApp"
            className="h-12 w-12 object-contain"
          />
          <span className="text-lg font-bold text-gray-900">NoteApp</span>
        </div>

        {/* Search */}
        <div className="shrink-0 px-4 pb-2 pt-4">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              aria-label="Search notes"
            />
          </div>
        </div>

        {/* Active filter indicator */}
        {selectedTag && (
          <div className="mx-4 mb-2 flex shrink-0 items-center justify-between rounded-lg bg-indigo-50 px-3 py-1.5">
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

        {/* Scrollable: Notes + Tags */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          <div className="py-2">
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Notes{' '}
              <span className="normal-case text-gray-300">({notes.length})</span>
            </h2>
            {notes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No notes found
              </p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <NoteCard
                    key={note.noteId}
                    note={note}
                    isActive={note.noteId === activeNoteId}
                    onSelect={handleSelectNote}
                    onDelete={(id) => setNoteToDelete(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <nav className="border-t border-gray-100 py-3" aria-label="Tag filters">
            <TagList />
          </nav>
        </div>

        {/* Account info & Sign out */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <FaCircleUser className="h-5 w-5 shrink-0 text-gray-500" />
            <span className="truncate text-sm text-gray-700">
              {user?.email}
            </span>
          </div>
          <button
            onClick={logout}
            disabled={!isOnline}
            className="shrink-0 rounded-xl p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Sign Out"
          >
            <FaRightFromBracket className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={noteToDelete !== null}
        title="Delete note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </>
  );
}
