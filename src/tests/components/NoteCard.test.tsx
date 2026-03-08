import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteCard } from '@/components/NoteCard/NoteCard';
import type { Note } from '@/types/note';

const mockNote: Note = {
  userId: 'user-1',
  noteId: 'note-1',
  title: 'My Test Note',
  content: 'This is some preview content for the note card.',
  tags: ['work', 'important'],
  color: '#D4EDDA',
  createdAt: '2026-03-01T12:00:00Z',
  lastEdited: '2026-03-07T12:00:00Z',
};

describe('NoteCard', () => {
  it('renders title and preview', () => {
    render(
      <NoteCard
        note={mockNote}
        isActive={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('My Test Note')).toBeInTheDocument();
    expect(
      screen.getByText(/This is some preview content/),
    ).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <NoteCard
        note={mockNote}
        isActive={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('applies background color from note', () => {
    render(
      <NoteCard
        note={mockNote}
        isActive={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const card = screen.getByRole('button', { name: 'My Test Note' });
    expect(card).toHaveStyle({ backgroundColor: '#D4EDDA' });
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <NoteCard
        note={mockNote}
        isActive={false}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('My Test Note'));
    expect(onSelect).toHaveBeenCalledWith('note-1');
  });

  it('calls onDelete when delete button clicked and does not propagate', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(
      <NoteCard
        note={mockNote}
        isActive={false}
        onSelect={onSelect}
        onDelete={onDelete}
      />,
    );

    const deleteBtn = screen.getByLabelText('Delete My Test Note');
    await user.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('note-1');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
