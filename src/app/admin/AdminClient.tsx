'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type {
  AdminStats,
  AdminUserDetail,
  AdminUserSummary,
  AdminUsersList,
} from '@/types/admin'

export function AdminClient() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersPage, setUsersPage] = useState(1)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersLoading, setUsersLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(usersTotal / pageSize))

  // Debounce do search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  // Reset pra página 1 ao buscar
  useEffect(() => {
    setUsersPage(1)
  }, [debouncedSearch])

  // Stats
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/stats')
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<AdminStats>
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setStatsError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const params = new URLSearchParams({
        page: String(usersPage),
        pageSize: String(pageSize),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const r = await fetch(`/api/admin/users?${params}`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = (await r.json()) as AdminUsersList
      setUsers(data.users)
      setUsersTotal(data.total)
    } catch (err) {
      setUsersError(String(err))
    } finally {
      setUsersLoading(false)
    }
  }, [usersPage, debouncedSearch])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  return (
    <div className="px-4 pt-6 pb-8 animate-fade-in max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-white/40 text-[11px] font-mono font-bold tracking-widest uppercase mb-4 -ml-1 hover:text-white/60 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>
      <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Painel interno</p>
      <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none mt-0.5">Admin</h1>
      <p className="text-[11px] text-white/40 font-mono tracking-wider mt-1 mb-7">Métricas · usuários · soft-delete</p>

      {/* Stats grid */}
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Métricas
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Usuários" value={stats?.totalUsers} accent="#f5c42e" />
        <StatCard label="Ativos 7d" value={stats?.activeUsersLast7d} accent="#6366f1" />
        <StatCard label="Ativos 24h" value={stats?.activeUsersLast24h} accent="#15a065" />
        <StatCard label="Figurinhas" value={stats?.totalStickersCollected} accent="#f5c42e" />
        <StatCard label="Média/ativo" value={stats?.avgStickersPerActiveUser} accent="#6366f1" />
        <StatCard label="Álbuns 100%" value={stats?.usersCompleted} accent="#15a065" />
      </div>
      {statsError && (
        <p className="text-[11px] font-mono uppercase tracking-wider text-red-400 mb-4">Stats: {statsError}</p>
      )}

      {/* Search */}
      <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-3 flex items-baseline gap-2">
        <span className="font-mono text-white/25" aria-hidden>—</span>
        Usuários
      </h2>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email ou nome…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-white/30 outline-none focus:border-white/30"
        />
      </div>

      {/* Users table */}
      <div
        className="rounded-2xl border border-white/5 overflow-hidden corner-cut corner-cut-sm"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'rgba(255, 255, 255, 0.22)',
        } as React.CSSProperties}
      >
        {usersError && (
          <p className="p-4 text-[11px] font-mono uppercase tracking-wider text-red-400">Users: {usersError}</p>
        )}
        {usersLoading && users.length === 0 && (
          <p className="p-4 text-[11px] font-mono uppercase tracking-widest text-white/40">Carregando…</p>
        )}
        {!usersLoading && users.length === 0 && (
          <p className="p-4 text-[11px] font-mono uppercase tracking-widest text-white/40">
            Nenhum usuário encontrado
          </p>
        )}

        <ul className="divide-y divide-white/5">
          {users.map((u) => (
            <li key={u.userId}>
              <button
                onClick={() => setSelectedUserId(u.userId)}
                className="w-full p-3 flex items-center gap-3 active:bg-white/5 transition-colors text-left"
              >
                {u.imageUrl ? (
                  <Image
                    src={u.imageUrl}
                    alt={u.name ?? 'avatar'}
                    width={36}
                    height={36}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-display font-black text-white/60">
                      {(u.name ?? u.email ?? '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-display font-bold tracking-wide uppercase text-white truncate">
                    {u.name ?? '(sem nome)'}
                  </p>
                  <p className="text-[11px] font-mono text-white/40 truncate mt-0.5">
                    {u.email ?? '(sem email)'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-display font-black tracking-tight leading-none text-copa-gold">
                    {u.stickerCount}
                  </p>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-white/30 mt-1">
                    {relativeTime(u.lastSeenAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="p-3 border-t border-white/5 flex items-center justify-between gap-2 text-[11px]">
            <button
              onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
              disabled={usersPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-[10px] font-mono font-bold tracking-widest uppercase disabled:opacity-30"
            >
              Anterior
            </button>
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">
              Pág {usersPage} · {totalPages} · {usersTotal} users
            </span>
            <button
              onClick={() => setUsersPage((p) => Math.min(totalPages, p + 1))}
              disabled={usersPage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-[10px] font-mono font-bold tracking-widest uppercase disabled:opacity-30"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onWiped={() => {
            setSelectedUserId(null)
            void fetchUsers()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value?: number; accent: string }) {
  return (
    <div
      className="rounded-2xl p-3 border border-white/5 corner-cut corner-cut-sm"
      style={{
        background: `linear-gradient(145deg, ${accent}10 0%, var(--copa-card) 100%)`,
        ['--cut-accent' as string]: `${accent}aa`,
      } as React.CSSProperties}
    >
      <p className="text-[9px] font-mono tracking-widest uppercase text-white/40">
        {label}
      </p>
      <p className="text-2xl font-display font-black tracking-tight leading-none mt-1.5" style={{ color: accent }}>
        {value === undefined ? '—' : value.toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

function UserDetailDrawer({
  userId,
  onClose,
  onWiped,
}: {
  userId: string
  onClose: () => void
  onWiped: () => void
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [wiping, setWiping] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/users/${encodeURIComponent(userId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<AdminUserDetail>
      })
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleWipe = async () => {
    if (!detail || wiping) return
    setWiping(true)
    try {
      const params = new URLSearchParams({ confirm: detail.userId })
      const r = await fetch(
        `/api/admin/users/${encodeURIComponent(detail.userId)}?${params}`,
        { method: 'DELETE' }
      )
      if (!r.ok) {
        const j = await r.json().catch(() => null)
        throw new Error(j?.error ?? `HTTP ${r.status}`)
      }
      onWiped()
    } catch (err) {
      setError(String(err))
    } finally {
      setWiping(false)
    }
  }

  const groupedStickers = useMemo(() => {
    if (!detail) return new Map<string, number>()
    const map = new Map<string, number>()
    for (const s of detail.stickers) {
      const team = s.sticker_id.split('_')[0]
      map.set(team, (map.get(team) ?? 0) + 1)
    }
    return map
  }, [detail])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !wiping) onClose()
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'var(--copa-card)' }}
      >
        <div className="p-5 border-b border-white/5 flex items-start gap-3">
          {detail?.imageUrl ? (
            <Image
              src={detail.imageUrl}
              alt={detail.name ?? 'avatar'}
              width={48}
              height={48}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-display font-black text-white/60">
                {(detail?.name ?? detail?.email ?? '?')[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">Usuário</p>
            <h2 className="text-base font-display font-black tracking-tight uppercase text-white truncate mt-0.5 leading-none">
              {detail?.name ?? '(sem nome)'}
            </h2>
            <p className="text-[11px] font-mono text-white/50 truncate mt-1.5">
              {detail?.email ?? '(sem email)'}
            </p>
            <p className="text-[9px] text-white/30 font-mono tracking-wider mt-0.5 truncate">
              {userId}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={wiping}
            aria-label="Fechar"
            className="text-white/30 p-1 active:scale-90 disabled:opacity-30 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {error && (
            <p className="text-[11px] font-mono uppercase tracking-wider text-red-400">{error}</p>
          )}

          {detail && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Figurinhas" value={detail.stickerCount} accent="#f5c42e" />
                <MiniStat label="Cópias" value={detail.totalCopies} accent="#6366f1" />
                <MiniStat
                  label="Repetidas"
                  value={detail.totalCopies - detail.stickerCount}
                  accent="#15a065"
                />
              </div>

              <div>
                <h3 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-2 flex items-baseline gap-2">
                  <span className="font-mono text-white/25" aria-hidden>—</span>
                  Atividade
                </h3>
                <div className="rounded-xl border border-white/5 p-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Primeira vez</span>
                    <span className="font-mono text-white/70">{formatDate(detail.firstSeenAt)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">Última atividade</span>
                    <span className="font-mono text-white/70">{formatDate(detail.lastSeenAt)}</span>
                  </div>
                </div>
              </div>

              {groupedStickers.size > 0 && (
                <div>
                  <h3 className="text-xs font-display font-bold text-white/40 uppercase tracking-[0.2em] mb-2 flex items-baseline gap-2">
                    <span className="font-mono text-white/25" aria-hidden>—</span>
                    Por seleção/seção
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {Array.from(groupedStickers.entries())
                      .sort(([, a], [, b]) => b - a)
                      .map(([team, count]) => (
                        <div
                          key={team}
                          className="rounded-lg bg-white/5 px-2 py-1.5 flex items-center justify-between"
                        >
                          <span className="font-mono tracking-wider text-white/60">
                            {team}
                          </span>
                          <span className="font-display font-black tracking-tight text-white">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-display font-bold text-red-400/70 uppercase tracking-[0.2em] mb-2 flex items-baseline gap-2">
                  <span className="font-mono text-red-400/50" aria-hidden>—</span>
                  Zona perigosa
                </h3>
                {!confirmWipe ? (
                  <button
                    onClick={() => setConfirmWipe(true)}
                    className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono font-bold tracking-widest uppercase active:scale-[0.98]"
                  >
                    Apagar figurinhas deste usuário…
                  </button>
                ) : (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 space-y-2">
                    <p className="text-[12px] text-white/70 leading-relaxed">
                      Vai marcar as <span className="font-display font-black tracking-tight text-white">{detail.stickerCount}</span> figurinhas como
                      removidas (soft-delete). Histórico fica preservado mas
                      o usuário perde acesso até recoletar.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmWipe(false)}
                        disabled={wiping}
                        className="flex-1 py-2 rounded-lg bg-white/5 text-white/60 text-[10px] font-mono font-bold tracking-widest uppercase disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleWipe}
                        disabled={wiping}
                        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-[10px] font-mono font-black tracking-widest uppercase disabled:opacity-50"
                      >
                        {wiping ? 'Apagando…' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-xl border border-white/5 p-2.5 text-center corner-cut corner-cut-sm"
      style={{
        background: `linear-gradient(145deg, ${accent}10 0%, var(--copa-card) 100%)`,
        ['--cut-accent' as string]: `${accent}88`,
      } as React.CSSProperties}
    >
      <p className="text-[9px] font-mono tracking-widest uppercase text-white/40">
        {label}
      </p>
      <p className="text-lg font-display font-black tracking-tight leading-none mt-1" style={{ color: accent }}>
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d`
    const months = Math.floor(days / 30)
    return `${months}m`
  } catch {
    return ''
  }
}
