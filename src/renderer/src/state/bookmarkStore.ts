import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BookmarkState {
  ids: string[]
  isBookmarked: (id: string) => boolean
  toggle: (id: string) => void
}

/**
 * User bookmarks (favourites), persisted to localStorage so they survive
 * restarts without needing to round-trip through the main process.
 */
export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ids: [],
      isBookmarked: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((existing) => existing !== id)
            : [...state.ids, id]
        }))
    }),
    { name: 'earthscope.bookmarks' }
  )
)
