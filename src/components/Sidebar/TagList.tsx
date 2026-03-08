import { useNoteStore } from '@/store/noteStore';
import { useUIStore } from '@/store/uiStore';
import { FaTag } from 'react-icons/fa6';
import { useMemo } from 'react';

export function TagList() {
  const notes = useNoteStore((s) => s.notes);
  const selectedTag = useUIStore((s) => s.selectedTag);
  const setSelectedTag = useUIStore((s) => s.setSelectedTag);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  if (allTags.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Tags
      </p>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => setSelectedTag(tag)}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            selectedTag === tag
              ? 'bg-indigo-50 font-medium text-indigo-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaTag className="h-3 w-3 shrink-0" />
          <span className="truncate">{tag}</span>
        </button>
      ))}
    </div>
  );
}
