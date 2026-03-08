export interface Note {
  userId: string;
  noteId: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  createdAt: string;
  lastEdited: string;
}

export type CreateNoteRequest = Pick<Note, 'title' | 'content' | 'tags' | 'color'>;

export type UpdateNoteRequest = Pick<Note, 'noteId' | 'title' | 'content' | 'tags' | 'color'>;

export interface NotesResponse {
  notes: Note[];
}

export interface NoteResponse {
  note: Note;
}

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';
