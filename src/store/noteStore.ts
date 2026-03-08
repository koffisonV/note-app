import { create } from 'zustand';
import type { Note, SyncState } from '@/types/note';
import * as api from '@/services/api';
import { getRandomColor } from '@/utils/colors';
import { v4 as uuidv4 } from 'uuid';

interface NoteStore {
  notes: Note[];
  activeNoteId: string | null;
  syncState: SyncState;
  isLoading: boolean;
  error: string | null;

  loadNotes: () => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'color'>>) => void;
  saveNote: (noteId: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  setActiveNote: (noteId: string | null) => void;
  setSyncState: (state: SyncState) => void;

  getActiveNote: () => Note | undefined;
  getFilteredNotes: (search: string, tag: string | null) => Note[];
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  activeNoteId: null,
  syncState: 'idle',
  isLoading: false,
  error: null,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await api.fetchNotes();
      set({ notes, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      throw e;
    }
  },

  createNote: async () => {
    const tempId = uuidv4();
    const now = new Date().toISOString();
    const optimisticNote: Note = {
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
      notes: [optimisticNote, ...state.notes],
      activeNoteId: tempId,
    }));

    try {
      const serverNote = await api.createNote({
        title: optimisticNote.title,
        content: optimisticNote.content,
        tags: optimisticNote.tags,
        color: optimisticNote.color,
      });

      set((state) => ({
        notes: state.notes.map((n) => (n.noteId === tempId ? serverNote : n)),
        activeNoteId: serverNote.noteId,
      }));
    } catch {
      set((state) => ({
        notes: state.notes.filter((n) => n.noteId !== tempId),
        activeNoteId: state.activeNoteId === tempId ? null : state.activeNoteId,
        error: 'Failed to create note',
      }));
    }
  },

  updateNote: (noteId, updates) => {
    set((state) => ({
      notes: state.notes.map((n) =>
        n.noteId === noteId
          ? { ...n, ...updates, lastEdited: new Date().toISOString() }
          : n,
      ),
    }));
  },

  saveNote: async (noteId) => {
    const note = get().notes.find((n) => n.noteId === noteId);
    if (!note) return;

    set({ syncState: 'saving' });
    try {
      const updated = await api.updateNote({
        noteId: note.noteId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color,
      });

      set((state) => ({
        notes: state.notes.map((n) => (n.noteId === noteId ? updated : n)),
        syncState: 'saved',
      }));
    } catch {
      set({ syncState: 'error' });
    }
  },

  deleteNote: async (noteId) => {
    const { notes, activeNoteId } = get();
    const deletedNote = notes.find((n) => n.noteId === noteId);

    set((state) => ({
      notes: state.notes.filter((n) => n.noteId !== noteId),
      activeNoteId: activeNoteId === noteId ? null : activeNoteId,
    }));

    try {
      await api.deleteNote(noteId);
    } catch {
      if (deletedNote) {
        set((state) => ({
          notes: [...state.notes, deletedNote],
          error: 'Failed to delete note',
        }));
      }
    }
  },

  setActiveNote: (noteId) => set({ activeNoteId: noteId, syncState: 'idle' }),

  setSyncState: (syncState) => set({ syncState }),

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
      .sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
  },
}));
