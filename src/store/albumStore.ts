'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TEAMS, FWC_SECTION, CC_SECTION } from '@/data/teams'

interface StickerEntry {
  quantity: number
}

interface AlbumStore {
  stickers: Record<string, StickerEntry>
  collect: (id: string) => void
  uncollect: (id: string) => void
  addDuplicate: (id: string) => void
  removeDuplicate: (id: string) => void
  getQuantity: (id: string) => number
  isCollected: (id: string) => boolean
  getTeamProgress: (teamCode: string) => { collected: number; total: number }
  getGroupProgress: (group: string) => { collected: number; total: number }
  getTotalProgress: () => { collected: number; total: number }
  getSectionProgress: (sectionCode: string) => { collected: number; total: number }
  getDuplicates: () => Array<{ id: string; quantity: number }>
  getMissing: (teamCode: string) => string[]
  resetAlbum: () => void
}

export const stickerId = (teamCode: string, number: string) => `${teamCode}_${number}`

export const useAlbumStore = create<AlbumStore>()(
  persist(
    (set, get) => ({
      stickers: {},

      collect(id) {
        set((state) => ({
          stickers: {
            ...state.stickers,
            [id]: { quantity: Math.max(1, (state.stickers[id]?.quantity ?? 0)) },
          },
        }))
      },

      uncollect(id) {
        set((state) => {
          const next = { ...state.stickers }
          delete next[id]
          return { stickers: next }
        })
      },

      addDuplicate(id) {
        set((state) => ({
          stickers: {
            ...state.stickers,
            [id]: { quantity: (state.stickers[id]?.quantity ?? 0) + 1 },
          },
        }))
      },

      removeDuplicate(id) {
        set((state) => {
          const current = state.stickers[id]?.quantity ?? 0
          if (current <= 1) {
            const next = { ...state.stickers }
            delete next[id]
            return { stickers: next }
          }
          return {
            stickers: { ...state.stickers, [id]: { quantity: current - 1 } },
          }
        })
      },

      getQuantity(id) {
        return get().stickers[id]?.quantity ?? 0
      },

      isCollected(id) {
        return (get().stickers[id]?.quantity ?? 0) > 0
      },

      getTeamProgress(teamCode) {
        const team = TEAMS.find((t) => t.code === teamCode)
        if (!team) return { collected: 0, total: 0 }
        const total = team.stickers.length
        const collected = team.stickers.filter((s) =>
          get().isCollected(stickerId(teamCode, s.number))
        ).length
        return { collected, total }
      },

      getGroupProgress(group) {
        const teams = TEAMS.filter((t) => t.group === group)
        let collected = 0
        let total = 0
        for (const team of teams) {
          const p = get().getTeamProgress(team.code)
          collected += p.collected
          total += p.total
        }
        return { collected, total }
      },

      getTotalProgress() {
        let collected = 0
        let total = 0
        for (const team of TEAMS) {
          const p = get().getTeamProgress(team.code)
          collected += p.collected
          total += p.total
        }
        const allSpecial = [...FWC_SECTION.stickers, ...CC_SECTION.stickers]
        total += allSpecial.length
        for (const s of FWC_SECTION.stickers) {
          if (get().isCollected(stickerId('FWC', s.number))) collected++
        }
        for (const s of CC_SECTION.stickers) {
          if (get().isCollected(stickerId('CC', s.number))) collected++
        }
        return { collected, total }
      },

      getSectionProgress(sectionCode) {
        const section =
          sectionCode === 'FWC' ? FWC_SECTION : CC_SECTION
        const total = section.stickers.length
        const collected = section.stickers.filter((s) =>
          get().isCollected(stickerId(sectionCode, s.number))
        ).length
        return { collected, total }
      },

      getDuplicates() {
        return Object.entries(get().stickers)
          .filter(([, v]) => v.quantity > 1)
          .map(([id, v]) => ({ id, quantity: v.quantity - 1 }))
          .sort((a, b) => b.quantity - a.quantity)
      },

      getMissing(teamCode) {
        const team = TEAMS.find((t) => t.code === teamCode)
        if (!team) return []
        return team.stickers
          .filter((s) => !get().isCollected(stickerId(teamCode, s.number)))
          .map((s) => s.number)
      },

      resetAlbum() {
        set({ stickers: {} })
      },
    }),
    {
      name: 'copa26-album-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
