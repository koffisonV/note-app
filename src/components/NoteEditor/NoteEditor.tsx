import { useCallback, useRef } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useDebounce } from '@/hooks/useDebounce';
import { EditorToolbar } from './EditorToolbar';
import { SyncStatus } from './SyncStatus';
import {
  applyFormat,
  wrapBold,
  wrapItalic,
  wrapUnderline,
  toBulletList,
  toNumberedList,
} from '@/utils/markdown';
import { FaPlus, FaTag, FaXmark } from 'react-icons/fa6';
import { useState } from 'react';

const DEBOUNCE_MS = 1000;

export function NoteEditor() {
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const getActiveNote = useNoteStore((s) => s.getActiveNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const saveNote = useNoteStore((s) => s.saveNote);
  const createNote = useNoteStore((s) => s.createNote);
  const syncState = useNoteStore((s) => s.syncState);
  const isOnline = useOnlineStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tagInput, setTagInput] = useState('');

  const note = getActiveNote();

  const debouncedSave = useCallback(() => {
    if (activeNoteId && isOnline) {
      saveNote(activeNoteId);
    }
  }, [activeNoteId, isOnline, saveNote]);

  useDebounce(debouncedSave, DEBOUNCE_MS, [note?.content, note?.title]);

  function handleContentChange(value: string) {
    if (!activeNoteId) return;
    updateNote(activeNoteId, { content: value });
  }

  function handleTitleChange(value: string) {
    if (!activeNoteId) return;
    updateNote(activeNoteId, { title: value });
  }

  function handleFormat(type: 'bold' | 'italic' | 'underline' | 'bullet' | 'numbered') {
    const textarea = textareaRef.current;
    if (!textarea || !activeNoteId) return;

    const formatters = {
      bold: wrapBold,
      italic: wrapItalic,
      underline: wrapUnderline,
      bullet: toBulletList,
      numbered: toNumberedList,
    };

    const result = applyFormat(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
      formatters[type],
    );

    updateNote(activeNoteId, { content: result.value });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function handleAddTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || !activeNoteId || !note) return;
    if (note.tags.includes(tag)) {
      setTagInput('');
      return;
    }
    updateNote(activeNoteId, { tags: [...note.tags, tag] });
    setTagInput('');
  }

  function handleRemoveTag(tag: string) {
    if (!activeNoteId || !note) return;
    updateNote(activeNoteId, { tags: note.tags.filter((t) => t !== tag) });
  }

  if (!note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-2xl bg-gray-50 p-6">
          <p className="text-lg font-medium text-gray-400">
            Select a note or create a new one
          </p>
          <button
            onClick={() => createNote()}
            disabled={!isOnline}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            <FaPlus className="h-3.5 w-3.5" />
            New Note
          </button>
        </div>
      </div>
    );
  }

  const lastEdited = new Date(note.lastEdited).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex-1">
          <input
            type="text"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
            placeholder="Note title"
            aria-label="Note title"
          />
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus status={syncState} />
          <button
            onClick={() => createNote()}
            disabled={!isOnline}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Create
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: note.color }}
            />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-2">
        <EditorToolbar onFormat={handleFormat} />
      </div>

      {/* Editor area */}
      <textarea
        ref={textareaRef}
        value={note.content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="flex-1 resize-none bg-gray-50 p-6 font-mono text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-300"
        placeholder="Start writing your note in Markdown..."
        aria-label="Note content"
      />

      {/* Footer: tags + timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
            >
              <FaTag className="h-2.5 w-2.5" />
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 hover:text-indigo-800"
                aria-label={`Remove tag ${tag}`}
              >
                <FaXmark className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="w-24 bg-transparent text-xs text-gray-500 outline-none placeholder:text-gray-300"
              aria-label="Add tag"
            />
          </div>
        </div>
        <span className="text-xs text-gray-400">Last updated: {lastEdited}</span>
      </div>
    </div>
  );
}
