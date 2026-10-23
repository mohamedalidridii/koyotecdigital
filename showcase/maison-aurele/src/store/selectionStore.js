import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// The Maison sells by appointment: visitors build a selection of pieces
// and send it as a private-fitting request.
export const useSelectionStore = create(
  persist(
    (set) => ({
      slugs: [],
      isOpen: false,

      add: (slug) =>
        set((state) =>
          state.slugs.includes(slug) ? state : { slugs: [...state.slugs, slug] }
        ),
      remove: (slug) => set((state) => ({ slugs: state.slugs.filter((s) => s !== slug) })),
      clear: () => set({ slugs: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "aurele-selection",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ slugs: state.slugs }),
      // Rehydrated after mount (see Selection.jsx) to keep SSR markup stable
      skipHydration: true,
    }
  )
);

export const useSelectionCount = () => useSelectionStore((state) => state.slugs.length);
