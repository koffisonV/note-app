import type { Note } from '@/types/note';
import { FaTrash, FaTag } from 'react-icons/fa6';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onSelect: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, isActive, onSelect, onDelete }: NoteCardProps) {
  const preview = note.content.slice(0, 80).replace(/\n/g, ' ') || 'Empty note';
  const lastEdited = new Date(note.lastEdited).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(note.noteId)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(note.noteId); }}
      className={`group relative w-full cursor-pointer rounded-2xl p-4 text-left transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-indigo-300 shadow-md' : 'hover:scale-[1.02]'
      }`}
      style={{ backgroundColor: note.color }}
      aria-label={note.title || 'Untitled'}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="line-clamp-1 pr-6 text-sm font-semibold text-gray-800">
          {note.title || 'Untitled'}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.noteId);
          }}
          className="absolute right-3 top-3 rounded-lg p-1 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100"
          aria-label={`Delete ${note.title}`}
        >
          <FaTrash className="h-3 w-3 text-gray-600" />
        </button>
      </div>

      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600">
        {preview}
      </p>

      {note.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-gray-600"
            >
              <FaTag className="h-2 w-2" />
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] text-gray-500">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <span className="text-[10px] text-gray-500">{lastEdited}</span>
    </div>
  );
}
