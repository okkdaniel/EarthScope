import { create } from 'zustand'
import type { EventCategoryId } from '@shared/models/category'
import type { EventFilter } from '@shared/services/search'

interface FilterState extends EventFilter {
  setQuery: (query: string) => void
  toggleCategory: (id: EventCategoryId) => void
  setCategoryEnabled: (id: EventCategoryId, enabled: boolean) => void
  setActiveOnly: (activeOnly: boolean) => void
  clearCategories: () => void
  reset: () => void
}

/**
 * Filter state is stored as a plain object with a `Set` of categories so the
 * pure `filterEvents` service can consume it directly. Zustand's referential
 * updates keep re-renders scoped to components that read the changed slice.
 */
export const useFilterStore = create<FilterState>((set) => ({
  categories: new Set<EventCategoryId>(),
  query: '',
  activeOnly: false,
  setQuery: (query) => set({ query }),
  toggleCategory: (id) =>
    set((state) => {
      const next = new Set(state.categories)
      next.has(id) ? next.delete(id) : next.add(id)
      return { categories: next }
    }),
  setCategoryEnabled: (id, enabled) =>
    set((state) => {
      const next = new Set(state.categories)
      enabled ? next.add(id) : next.delete(id)
      return { categories: next }
    }),
  setActiveOnly: (activeOnly) => set({ activeOnly }),
  clearCategories: () => set({ categories: new Set() }),
  reset: () => set({ categories: new Set(), query: '', activeOnly: false })
}))
