import type { Editor } from '@tiptap/react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
} from 'react-icons/fa6';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const tools = [
    {
      type: 'bold',
      icon: FaBold,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      type: 'italic',
      icon: FaItalic,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      type: 'underline',
      icon: FaUnderline,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      type: 'bullet',
      icon: FaListUl,
      label: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      type: 'numbered',
      icon: FaListOl,
      label: 'Numbered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
      {tools.map(({ type, icon: Icon, label, action, isActive }) => (
        <button
          key={type}
          onClick={action}
          aria-label={label}
          className={`rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300 ${
            isActive
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
