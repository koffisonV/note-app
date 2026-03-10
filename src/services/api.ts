import { fetchAuthSession } from 'aws-amplify/auth';
import type {
  Note,
  NotesResponse,
  NoteResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '@/types/note';

const API_BASE = import.meta.env.VITE_API_ENDPOINT;

export class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error {
  status: number;
  constructor(status: number, message = 'Server error') {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

async function getAuthToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) throw new AuthError();
  return token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!navigator.onLine) {
    throw new NetworkError('You are offline');
  }

  const token = await getAuthToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401) {
    throw new AuthError();
  }

  if (!response.ok) {
    throw new ServerError(response.status, await response.text());
  }

  return response.json() as Promise<T>;
}

export async function fetchNotes(): Promise<Note[]> {
  const data = await request<NotesResponse>('/notes');
  return data.notes;
}

export async function createNote(note: CreateNoteRequest): Promise<Note> {
  const data = await request<NoteResponse>('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
  return data.note;
}

export async function updateNote(note: UpdateNoteRequest): Promise<Note> {
  const data = await request<NoteResponse>(`/notes/${note.noteId}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
  return data.note;
}

export async function deleteNote(noteId: string): Promise<void> {
  await request<void>(`/notes/${noteId}`, { method: 'DELETE' });
}
