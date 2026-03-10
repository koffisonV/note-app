import { create } from 'zustand';
import type { Note, SyncState } from '@/types/note';
import * as api from '@/services/api';
import { getRandomColor } from '@/utils/colors';
import { v4 as uuidv4 } from 'uuid';

const SYNC_RESET_MS = 2500;
const ERROR_DISMISS_MS = 5000;

interface NoteStore {
  notes: Note[];
  activeNoteId: string | null;
  syncState: SyncState;
  isLoading: boolean;
  error: string | null;

  pendingCreates: Record<string, true>;
  pendingDeletes: Record<string, true>;
  dirtyNoteIds: Record<string, true>;
  _savingNotes: Record<string, true>;
  _isFlushing: boolean;

  loadNotes: () => Promise<void>;
  createNote: () => void;
  updateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'color'>>) => void;
  saveNote: (noteId: string) => Promise<void>;
  deleteNote: (noteId: string) => void;
  setActiveNote: (noteId: string | null) => void;
  flushPendingChanges: () => Promise<void>;
  clearError: () => void;

  getActiveNote: () => Note | undefined;
  getFilteredNotes: (search: string, tag: string | null) => Note[];
  hasPendingChanges: () => boolean;
  removeTagFromAllNotes: (tag: string) => void;
}

let syncResetTimer: ReturnType<typeof setTimeout> | null = null;
let errorDismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useNoteStore = create<NoteStore>((set, get) => {
  function scheduleSyncReset() {
    if (syncResetTimer) clearTimeout(syncResetTimer);
    syncResetTimer = setTimeout(() => {
      const { syncState } = get();
      if (syncState === 'saved' || syncState === 'error') {
        set({ syncState: 'idle' });
      }
    }, SYNC_RESET_MS);
  }

  function scheduleErrorDismiss() {
    if (errorDismissTimer) clearTimeout(errorDismissTimer);
    errorDismissTimer = setTimeout(() => {
      set({ error: null });
    }, ERROR_DISMISS_MS);
  }

  return {
    notes: [],
    activeNoteId: null,
    syncState: 'idle',
    isLoading: false,
    error: null,

    pendingCreates: {},
    pendingDeletes: {},
    dirtyNoteIds: {},
    _savingNotes: {},
    _isFlushing: false,

    loadNotes: async () => {
      set({ isLoading: true, error: null });
      try {
        const serverNotes = await api.fetchNotes();
        const { pendingCreates, notes: localNotes } = get();
        const localOnlyNotes = localNotes.filter((n) => n.noteId in pendingCreates);

        set({
          notes: [...serverNotes, ...localOnlyNotes],
          isLoading: false,
        });
      } catch (e) {
        set({ isLoading: false, error: (e as Error).message });
      }
    },

    createNote: () => {
      const tempId = uuidv4();
      const now = new Date().toISOString();
      const note: Note = {
        userId: '',
        noteId: tempId,
        title: 'Untitled Note',
        content: '',
        tags: [],
        color: getRandomColor(),
        createdAt: now,
        lastEdited: now,
      };

      set((state) => ({
        notes: [note, ...state.notes],
        activeNoteId: tempId,
        pendingCreates: { ...state.pendingCreates, [tempId]: true },
        error: null,
      }));

      if (navigator.onLine) {
        get().saveNote(tempId);
      }
    },

    updateNote: (noteId, updates) => {
      set((state) => ({
        notes: state.notes.map((n) =>
          n.noteId === noteId
            ? { ...n, ...updates, lastEdited: new Date().toISOString() }
            : n,
        ),
        dirtyNoteIds: { ...state.dirtyNoteIds, [noteId]: true },
      }));
    },

    saveNote: async (noteId) => {
      const { pendingCreates, notes, _savingNotes, dirtyNoteIds } = get();
      const note = notes.find((n) => n.noteId === noteId);
      if (!note) return;
      if (!navigator.onLine) return;
      if (noteId in _savingNotes) return;

      const isCreate = noteId in pendingCreates;
      if (!isCreate && !(noteId in dirtyNoteIds)) return;

      set((state) => ({
        syncState: 'saving',
        error: null,
        _savingNotes: { ...state._savingNotes, [noteId]: true },
      }));

      let savedNoteId = noteId;
      let succeeded = false;

      try {
        const snapshot = {
          title: note.title,
          content: note.content,
          tags: [...note.tags],
          color: note.color,
        };

        if (isCreate) {
          const serverNote = await api.createNote(snapshot);
          savedNoteId = serverNote.noteId;

          const currentNote = get().notes.find((n) => n.noteId === noteId);
          const wasModified = currentNote && (
            currentNote.title !== snapshot.title ||
            currentNote.content !== snapshot.content ||
            currentNote.color !== snapshot.color ||
            JSON.stringify(currentNote.tags) !== JSON.stringify(snapshot.tags)
          );

          set((state) => {
            const newPending = { ...state.pendingCreates };
            delete newPending[noteId];
            const newDirty = { ...state.dirtyNoteIds };
            delete newDirty[noteId];
            if (wasModified) newDirty[serverNote.noteId] = true;

            return {
              notes: state.notes.map((n) =>
                n.noteId === noteId
                  ? {
                      ...n,
                      noteId: serverNote.noteId,
                      userId: serverNote.userId,
                      createdAt: serverNote.createdAt,
                    }
                  : n,
              ),
              activeNoteId:
                state.activeNoteId === noteId
                  ? serverNote.noteId
                  : state.activeNoteId,
              pendingCreates: newPending,
              dirtyNoteIds: newDirty,
              syncState: 'saved',
            };
          });
        } else {
          await api.updateNote({
            noteId: note.noteId,
            title: snapshot.title,
            content: snapshot.content,
            tags: snapshot.tags,
            color: snapshot.color,
          });

          const currentNote = get().notes.find((n) => n.noteId === noteId);
          const wasModified = currentNote && (
            currentNote.title !== snapshot.title ||
            currentNote.content !== snapshot.content ||
            currentNote.color !== snapshot.color ||
            JSON.stringify(currentNote.tags) !== JSON.stringify(snapshot.tags)
          );

          set((state) => {
            if (wasModified) return { syncState: 'saved' };
            const newDirty = { ...state.dirtyNoteIds };
            delete newDirty[noteId];
            return { dirtyNoteIds: newDirty, syncState: 'saved' };
          });
        }

        succeeded = true;
        scheduleSyncReset();
      } catch {
        set({ syncState: 'error', error: 'Failed to save note' });
        scheduleErrorDismiss();
      } finally {
        set((state) => {
          const newSaving = { ...state._savingNotes };
          delete newSaving[noteId];
          return { _savingNotes: newSaving };
        });

        if (succeeded && savedNoteId in get().dirtyNoteIds && navigator.onLine) {
          setTimeout(() => get().saveNote(savedNoteId), 200);
        }
      }
    },

    deleteNote: (noteId) => {
      const { activeNoteId, pendingCreates } = get();
      const isLocalOnly = noteId in pendingCreates;

      set((state) => {
        const newPending = { ...state.pendingCreates };
        delete newPending[noteId];
        const newDirty = { ...state.dirtyNoteIds };
        delete newDirty[noteId];

        return {
          notes: state.notes.filter((n) => n.noteId !== noteId),
          activeNoteId: activeNoteId === noteId ? null : activeNoteId,
          pendingCreates: newPending,
          dirtyNoteIds: newDirty,
          error: null,
        };
      });

      if (isLocalOnly) return;

      if (navigator.onLine) {
        api.deleteNote(noteId).catch(() => {
          set({ error: 'Failed to delete note' });
          scheduleErrorDismiss();
        });
      } else {
        set((state) => ({
          pendingDeletes: { ...state.pendingDeletes, [noteId]: true },
        }));
      }
    },

    setActiveNote: (noteId) => {
      const { activeNoteId, dirtyNoteIds } = get();
      if (activeNoteId && activeNoteId in dirtyNoteIds && navigator.onLine) {
        get().saveNote(activeNoteId);
      }
      set({ activeNoteId: noteId, syncState: 'idle' });
    },

    clearError: () => set({ error: null }),

    flushPendingChanges: async () => {
      if (get()._isFlushing || !navigator.onLine) return;

      const { pendingCreates, pendingDeletes, dirtyNoteIds } = get();
      const hasWork =
        Object.keys(pendingCreates).length > 0 ||
        Object.keys(pendingDeletes).length > 0 ||
        Object.keys(dirtyNoteIds).length > 0;

      if (!hasWork) return;

      set({ _isFlushing: true, syncState: 'saving' });

      try {
        for (const tempId of Object.keys(get().pendingCreates)) {
          if (!navigator.onLine) break;
          await get().saveNote(tempId);
        }

        for (const noteId of Object.keys(get().dirtyNoteIds)) {
          if (!navigator.onLine) break;
          if (noteId in get().pendingCreates) continue;
          await get().saveNote(noteId);
        }

        for (const noteId of Object.keys(get().pendingDeletes)) {
          if (!navigator.onLine) break;
          try {
            await api.deleteNote(noteId);
            set((state) => {
              const newPD = { ...state.pendingDeletes };
              delete newPD[noteId];
              return { pendingDeletes: newPD };
            });
          } catch {
            /* will retry on next flush */
          }
        }

        const remaining = get().hasPendingChanges();
        set({ syncState: remaining ? 'error' : 'saved' });
        scheduleSyncReset();
      } catch {
        set({ syncState: 'error' });
        scheduleSyncReset();
      } finally {
        set({ _isFlushing: false });
      }
    },

    getActiveNote: () => {
      const { notes, activeNoteId } = get();
      return notes.find((n) => n.noteId === activeNoteId);
    },

    getFilteredNotes: (search, tag) => {
      const { notes } = get();
      const query = search.toLowerCase();
      return notes
        .filter((n) => {
          const matchesSearch =
            !query ||
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query);
          const matchesTag = !tag || n.tags.includes(tag);
          return matchesSearch && matchesTag;
        })
        .sort(
          (a, b) =>
            new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime(),
        );
    },

    hasPendingChanges: () => {
      const { pendingCreates, pendingDeletes, dirtyNoteIds } = get();
      return (
        Object.keys(pendingCreates).length > 0 ||
        Object.keys(pendingDeletes).length > 0 ||
        Object.keys(dirtyNoteIds).length > 0
      );
    },

    removeTagFromAllNotes: (tag) => {
      const { notes } = get();
      const notesWithTag = notes.filter((n) => n.tags.includes(tag));
      for (const note of notesWithTag) {
        get().updateNote(note.noteId, {
          tags: note.tags.filter((t) => t !== tag),
        });
        if (navigator.onLine) {
          get().saveNote(note.noteId);
        }
      }
    },
  };
});
