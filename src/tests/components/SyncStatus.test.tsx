import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncStatus } from '@/components/NoteEditor/SyncStatus';

describe('SyncStatus', () => {
  it('renders nothing for idle', () => {
    const { container } = render(<SyncStatus status="idle" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "Saving..." for saving state', () => {
    render(<SyncStatus status="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders "Saved" for saved state', () => {
    render(<SyncStatus status="saved" />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders "Error" for error state', () => {
    render(<SyncStatus status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
