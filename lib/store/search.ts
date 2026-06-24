import { create } from 'zustand'
import type { SearchParams } from '@/types'
import { todayISO, tomorrowISO } from '@/lib/utils'

interface SearchState {
  params: SearchParams
  setParams: (params: Partial<SearchParams>) => void
  resetParams: () => void
}

const DEFAULT_PARAMS: SearchParams = {
  location: '',
  checkIn: todayISO(),
  checkOut: tomorrowISO(),
  guests: 2,
  sortBy: 'popular',
  page: 1,
}

export const useSearchStore = create<SearchState>((set) => ({
  params: DEFAULT_PARAMS,

  setParams: (partial) =>
    set((state) => ({ params: { ...state.params, ...partial } })),

  resetParams: () => set({ params: DEFAULT_PARAMS }),
}))
