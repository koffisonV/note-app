import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  searchQuery: string;
  selectedTag: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  searchQuery: '',
  selectedTag: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTag: (tag) =>
    set((state) => ({
      selectedTag: state.selectedTag === tag ? null : tag,
    })),
}));
