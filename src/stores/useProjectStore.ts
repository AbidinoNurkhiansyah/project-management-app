import { create } from "zustand";

interface ProjectState {
  activeProjectId: string | null;
  recentProjectIds: string[];
  setActiveProjectId: (id: string | null) => void;
  addRecentProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProjectId: null,
  recentProjectIds: [],
  setActiveProjectId: (id) =>
    set((state) => {
      if (!id) return { activeProjectId: null };
      const updatedRecents = [
        id,
        ...state.recentProjectIds.filter((p) => p !== id),
      ].slice(0, 5);
      return { activeProjectId: id, recentProjectIds: updatedRecents };
    }),
  addRecentProject: (id) =>
    set((state) => ({
      recentProjectIds: [
        id,
        ...state.recentProjectIds.filter((p) => p !== id),
      ].slice(0, 5),
    })),
}));
