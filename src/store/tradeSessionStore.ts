'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Sessão de troca presencial — efêmera por design.
 *
 * Guarda o que o usuário está ENTREGANDO (`giving`) e PEGANDO (`taking`) numa
 * troca de rua, como stickerId → quantidade. Persistido em sessionStorage:
 * sobrevive a troca de aba dentro do app e a reload, mas some ao fechar o
 * navegador — é um bloco de notas da troca atual, não parte da coleção.
 */
interface TradeSessionStore {
  giving: Record<string, number>
  taking: Record<string, number>
  addGiving: (id: string, max: number) => void
  removeGiving: (id: string) => void
  setGiving: (id: string, n: number) => void
  addTaking: (id: string) => void
  removeTaking: (id: string) => void
  clear: () => void
}

function bump(map: Record<string, number>, id: string, delta: number, max = Infinity): Record<string, number> {
  const next = { ...map }
  const value = (next[id] ?? 0) + delta
  if (value <= 0) delete next[id]
  else next[id] = Math.min(value, max)
  return next
}

export const useTradeSession = create<TradeSessionStore>()(
  persist(
    (set) => ({
      giving: {},
      taking: {},

      // `max` = extras disponíveis daquela repetida (quantity − 1). Não deixa
      // entregar mais do que se tem.
      addGiving(id, max) {
        set((s) => ({ giving: bump(s.giving, id, +1, max) }))
      },
      removeGiving(id) {
        set((s) => ({ giving: bump(s.giving, id, -1) }))
      },
      // Define direto a quantidade entregue (toque-pra-ciclar nos chips). n<=0 remove.
      setGiving(id, n) {
        set((s) => {
          const next = { ...s.giving }
          if (n <= 0) delete next[id]
          else next[id] = n
          return { giving: next }
        })
      },
      addTaking(id) {
        set((s) => ({ taking: bump(s.taking, id, +1) }))
      },
      removeTaking(id) {
        set((s) => ({ taking: bump(s.taking, id, -1) }))
      },

      clear() {
        set({ giving: {}, taking: {} })
      },
    }),
    {
      name: 'copa26-trade-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

// Helpers puros pra placar (totais).
export function tradeTotal(map: Record<string, number>): number {
  return Object.values(map).reduce((acc, n) => acc + n, 0)
}
