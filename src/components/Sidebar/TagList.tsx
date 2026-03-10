import { useMemo } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { useUIStore } from '@/store/uiStore';
import { FaTag, FaXmark } from 'react-icons/fa6';

export function TagList() {
  const notes = useNoteStore((s) => s.notes);
  const removeTagFromAllNotes = useNoteStore((s) => s.removeTagFromAllNotes);
  const selectedTag = useUIStore((s) => s.selectedTag);
  const setSelectedTag = useUIStore((s) => s.setSelectedTag);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  if (allTags.length === 0) return null;

  function handleRemoveTag(e: React.MouseEvent, tag: string) {
    e.stopPropagation();
    removeTagFromAllNotes(tag);
    if (selectedTag === tag) {
      setSelectedTag(null);
    }
  }

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Tags
      </p>
      {allTags.map((tag) => (
        <div
          key={tag}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedTag(tag)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedTag(tag);
            }
          }}
          className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            selectedTag === tag
              ? 'bg-indigo-50 font-medium text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaTag className="h-3 w-3 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{tag}</span>
          <button
            type="button"
            onClick={(e) => handleRemoveTag(e, tag)}
            className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            aria-label={`Remove tag "${tag}" from all notes`}
          >
            <FaXmark className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
