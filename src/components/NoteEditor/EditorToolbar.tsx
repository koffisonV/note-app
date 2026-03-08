import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
} from 'react-icons/fa6';

interface EditorToolbarProps {
  onFormat: (type: 'bold' | 'italic' | 'underline' | 'bullet' | 'numbered') => void;
}

const tools = [
  { type: 'bold' as const, icon: FaBold, label: 'Bold' },
  { type: 'italic' as const, icon: FaItalic, label: 'Italic' },
  { type: 'underline' as const, icon: FaUnderline, label: 'Underline' },
  { type: 'bullet' as const, icon: FaListUl, label: 'Bullet list' },
  { type: 'numbered' as const, icon: FaListOl, label: 'Numbered list' },
];

export function EditorToolbar({ onFormat }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
      {tools.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onFormat(type)}
          aria-label={label}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-white hover:text-gray-900 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
