import { useState } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { useUIStore } from '@/store/uiStore';
import { NoteCard } from '@/components/NoteCard/NoteCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function RightPanel() {
  const getFilteredNotes = useNoteStore((s) => s.getFilteredNotes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const selectedTag = useUIStore((s) => s.selectedTag);
  const isOnline = useOnlineStatus();

  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const notes = getFilteredNotes(searchQuery, selectedTag);

  function handleDelete() {
    if (noteToDelete) {
      deleteNote(noteToDelete);
      setNoteToDelete(null);
    }
  }

  return (
    <>
      <aside className="flex w-full flex-col border-t border-gray-100 bg-white lg:w-80 lg:border-l lg:border-t-0">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Notes{' '}
            <span className="text-gray-400">({notes.length})</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No notes found
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.noteId}
                  note={note}
                  isActive={note.noteId === activeNoteId}
                  onSelect={setActiveNote}
                  onDelete={(id) => {
                    if (isOnline) setNoteToDelete(id);
                  }}
                />
              ))}
            </div>
          )}
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
