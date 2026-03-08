import { describe, it, expect, beforeEach } from 'vitest';
import { useNoteStore } from '@/store/noteStore';
import type { Note } from '@/types/note';

function createMockNote(overrides: Partial<Note> = {}): Note {
  return {
    userId: 'user-1',
    noteId: `note-${Date.now()}`,
    title: 'Test Note',
    content: 'Some content',
    tags: [],
    color: '#F9E4B7',
    createdAt: new Date().toISOString(),
    lastEdited: new Date().toISOString(),
    ...overrides,
  };
}

describe('noteStore', () => {
  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      activeNoteId: null,
      syncState: 'idle',
      isLoading: false,
      error: null,
    });
  });

  it('updateNote modifies content and lastEdited', () => {
    const note = createMockNote({ noteId: 'n1' });
    useNoteStore.setState({ notes: [note] });

    useNoteStore.getState().updateNote('n1', { content: 'updated' });

    const updated = useNoteStore.getState().notes[0];
    expect(updated.content).toBe('updated');
    expect(new Date(updated.lastEdited).getTime()).toBeGreaterThanOrEqual(
      new Date(note.lastEdited).getTime(),
    );
  });

  it('setActiveNote sets the activeNoteId', () => {
    useNoteStore.getState().setActiveNote('n1');
    expect(useNoteStore.getState().activeNoteId).toBe('n1');
  });

  it('getActiveNote returns the active note', () => {
    const note = createMockNote({ noteId: 'n1' });
    useNoteStore.setState({ notes: [note], activeNoteId: 'n1' });

    expect(useNoteStore.getState().getActiveNote()).toEqual(note);
  });

  it('getActiveNote returns undefined when no note is active', () => {
    expect(useNoteStore.getState().getActiveNote()).toBeUndefined();
  });

  it('getFilteredNotes filters by search query', () => {
    const notes = [
      createMockNote({ noteId: 'n1', title: 'React hooks', content: '' }),
      createMockNote({ noteId: 'n2', title: 'Vue basics', content: '' }),
    ];
    useNoteStore.setState({ notes });

    const filtered = useNoteStore.getState().getFilteredNotes('react', null);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].noteId).toBe('n1');
  });

  it('getFilteredNotes filters by tag', () => {
    const notes = [
      createMockNote({ noteId: 'n1', tags: ['work'] }),
      createMockNote({ noteId: 'n2', tags: ['personal'] }),
    ];
    useNoteStore.setState({ notes });

    const filtered = useNoteStore.getState().getFilteredNotes('', 'work');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].noteId).toBe('n1');
  });

  it('getFilteredNotes returns all notes when no filters', () => {
    const notes = [
      createMockNote({ noteId: 'n1' }),
      createMockNote({ noteId: 'n2' }),
    ];
    useNoteStore.setState({ notes });

    expect(useNoteStore.getState().getFilteredNotes('', null)).toHaveLength(2);
  });

  it('getFilteredNotes sorts by lastEdited descending', () => {
    const notes = [
      createMockNote({ noteId: 'n1', lastEdited: '2026-01-01T00:00:00Z' }),
      createMockNote({ noteId: 'n2', lastEdited: '2026-03-01T00:00:00Z' }),
    ];
    useNoteStore.setState({ notes });

    const sorted = useNoteStore.getState().getFilteredNotes('', null);
    expect(sorted[0].noteId).toBe('n2');
    expect(sorted[1].noteId).toBe('n1');
  });

  it('deleteNote removes the note from the list', () => {
    const note = createMockNote({ noteId: 'n1' });
    useNoteStore.setState({ notes: [note] });

    useNoteStore.getState().deleteNote('n1');
    expect(useNoteStore.getState().notes).toHaveLength(0);
  });

  it('deleteNote clears activeNoteId if deleting the active note', () => {
    const note = createMockNote({ noteId: 'n1' });
    useNoteStore.setState({ notes: [note], activeNoteId: 'n1' });

    useNoteStore.getState().deleteNote('n1');
    expect(useNoteStore.getState().activeNoteId).toBeNull();
  });
});
