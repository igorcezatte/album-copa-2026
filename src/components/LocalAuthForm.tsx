'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { signIn } from 'next-auth/react'

type Tab = 'login' | 'signup'

interface LocalAuthFormProps {
  /** Modo de apresentação. 'modal' adiciona backdrop + container; 'inline' renderiza só o form. */
  variant?: 'modal' | 'inline'
  /** Aba inicial. Default: 'signup' (mais comum no contexto de novos usuários). */
  initialTab?: Tab
  /** Callback chamado quando o user fecha o modal (só em variant=modal). */
  onClose?: () => void
  /** Callback chamado em sucesso (login ou signup). */
  onSuccess?: () => void
}

type ErrorState =
  | { kind: 'none' }
  | { kind: 'invalid_username' }
  | { kind: 'invalid_password' }
  | { kind: 'username_taken'; suggestions: string[] }
  | { kind: 'wrong_credentials' }
  | { kind: 'rate_limited'; retryAfterMs?: number }
  | { kind: 'network' }
  | { kind: 'unknown' }

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/

export function LocalAuthForm({
  variant = 'inline',
  initialTab = 'signup',
  onClose,
  onSuccess,
}: LocalAuthFormProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorState>({ kind: 'none' })
  const [usernameAvail, setUsernameAvail] = useState<
    'checking' | 'available' | 'taken' | 'invalid' | 'idle'
  >('idle')
  const checkAbortRef = useRef<AbortController | null>(null)

  const isModal = variant === 'modal'

  // Reset estado ao trocar de aba
  useEffect(() => {
    setError({ kind: 'none' })
    setUsernameAvail('idle')
  }, [tab])

  // Debounce do check de disponibilidade (só em signup)
  useEffect(() => {
    if (tab !== 'signup') {
      setUsernameAvail('idle')
      return
    }
    if (!username) {
      setUsernameAvail('idle')
      return
    }
    if (!USERNAME_PATTERN.test(username)) {
      setUsernameAvail('invalid')
      return
    }

    setUsernameAvail('checking')
    const timer = setTimeout(async () => {
      checkAbortRef.current?.abort()
      const ctrl = new AbortController()
      checkAbortRef.current = ctrl
      try {
        const r = await fetch(
          `/api/auth/local/check-username?u=${encodeURIComponent(username)}`,
          { signal: ctrl.signal }
        )
        const data = await r.json()
        if (ctrl.signal.aborted) return
        setUsernameAvail(data.available ? 'available' : 'taken')
      } catch {
        // network / abort — não altera estado
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username, tab])

  // Esc pra fechar o modal
  useEffect(() => {
    if (!isModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isModal, onClose, loading])

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (loading) return

      // Validação de form básica antes de bater na API
      if (!USERNAME_PATTERN.test(username)) {
        setError({ kind: 'invalid_username' })
        return
      }
      if (password.length < 5) {
        setError({ kind: 'invalid_password' })
        return
      }

      setLoading(true)
      setError({ kind: 'none' })

      try {
        if (tab === 'signup') {
          const r = await fetch('/api/auth/local/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })
          const data = await r.json().catch(() => null)

          if (r.status === 429) {
            setError({
              kind: 'rate_limited',
              retryAfterMs: data?.retryAfterMs,
            })
            return
          }
          if (!r.ok || !data?.ok) {
            if (data?.error === 'username_taken') {
              setError({
                kind: 'username_taken',
                suggestions: data.suggestions ?? [],
              })
            } else if (data?.error === 'invalid_username') {
              setError({ kind: 'invalid_username' })
            } else if (data?.error === 'invalid_password') {
              setError({ kind: 'invalid_password' })
            } else {
              setError({ kind: 'unknown' })
            }
            return
          }
        }

        // Login (após signup ou direto)
        const signRes = await signIn('local', {
          username,
          password,
          redirect: false,
        })

        if (!signRes || signRes.error) {
          setError({ kind: 'wrong_credentials' })
          return
        }

        onSuccess?.()
        if (isModal) onClose?.()
      } catch {
        setError({ kind: 'network' })
      } finally {
        setLoading(false)
      }
    },
    [tab, username, password, loading, onSuccess, onClose, isModal]
  )

  const form = (
    <form onSubmit={submit} className="space-y-4">
      {/* Toggle de abas */}
      <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-mono font-bold tracking-widest uppercase transition-colors ${
            tab === 'login'
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-mono font-bold tracking-widest uppercase transition-colors ${
            tab === 'signup'
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          Criar conta
        </button>
      </div>

      {/* Disclaimer só em signup */}
      {tab === 'signup' && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3">
          <p className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-300 leading-tight">
            ⚠ Sem email, sem recuperação
          </p>
          <p className="text-[11px] text-white/60 leading-relaxed mt-1.5">
            Anote sua senha. Se esquecer, perde o álbum dessa conta — não temos
            email pra recuperar. Pra mais segurança, prefira entrar com Google.
          </p>
        </div>
      )}

      {/* Apelido */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">
          Apelido
        </label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: joao-da-silva"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            disabled={loading}
            maxLength={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-white/25 outline-none focus:border-white/30 font-mono tracking-wider lowercase"
          />
          {tab === 'signup' && username && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tracking-wider">
              {usernameAvail === 'checking' && (
                <span className="text-white/30">…</span>
              )}
              {usernameAvail === 'available' && (
                <span className="text-copa-field">✓ livre</span>
              )}
              {usernameAvail === 'taken' && (
                <span className="text-red-400">✗ tomado</span>
              )}
              {usernameAvail === 'invalid' && (
                <span className="text-white/30">—</span>
              )}
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/30 font-mono tracking-wider">
          3-20 caracteres · letras, números, hífen ou underscore
        </p>
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-bold tracking-widest uppercase text-white/40">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 5 caracteres"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            disabled={loading}
            maxLength={100}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 pr-12 text-sm text-white placeholder-white/25 outline-none focus:border-white/30 font-mono tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white/60 transition-colors"
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error.kind !== 'none' && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-[11px] text-red-300 leading-relaxed">
            {error.kind === 'invalid_username' &&
              'Apelido inválido. Use 3-20 letras, números, hífen ou underscore.'}
            {error.kind === 'invalid_password' &&
              'Senha precisa ter pelo menos 5 caracteres.'}
            {error.kind === 'wrong_credentials' && 'Apelido ou senha incorretos.'}
            {error.kind === 'network' &&
              'Falha de rede. Verifique sua conexão e tente de novo.'}
            {error.kind === 'unknown' &&
              'Algo deu errado. Tente de novo em alguns segundos.'}
            {error.kind === 'rate_limited' && (
              <>
                Muitas tentativas. Espere{' '}
                {Math.ceil((error.retryAfterMs ?? 60_000) / 1000)}s e tente de
                novo.
              </>
            )}
            {error.kind === 'username_taken' && (
              <>
                Esse apelido já existe.
                {error.suggestions.length > 0 && (
                  <span className="block mt-2 text-white/60">
                    Que tal:{' '}
                    {error.suggestions.map((s, i) => (
                      <span key={s}>
                        {i > 0 && ', '}
                        <button
                          type="button"
                          onClick={() => {
                            setUsername(s)
                            setError({ kind: 'none' })
                          }}
                          className="font-mono text-copa-gold underline underline-offset-2 hover:text-amber-300"
                        >
                          {s}
                        </button>
                      </span>
                    ))}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={
          loading ||
          !username ||
          !password ||
          (tab === 'signup' && usernameAvail === 'taken')
        }
        className="w-full py-3.5 rounded-2xl bg-copa-green text-white font-display font-black tracking-wide uppercase active:scale-[0.98] transition-transform disabled:opacity-40"
      >
        {loading
          ? '...'
          : tab === 'signup'
            ? 'Criar conta e entrar'
            : 'Entrar'}
      </button>
    </form>
  )

  if (!isModal) return form

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="local-auth-title"
      onClick={() => !loading && onClose?.()}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-2xl corner-cut corner-cut-md"
        style={{
          background: 'var(--copa-card)',
          ['--cut-accent' as string]: 'var(--cut-accent-neutral)',
        } as React.CSSProperties}
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-white/30 font-mono tracking-[0.22em] uppercase">
              Sem Google
            </p>
            <h2
              id="local-auth-title"
              className="text-xl font-display font-black text-white tracking-tight uppercase leading-none mt-1"
            >
              Apelido e senha
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={loading}
            className="text-white/40 hover:text-white p-1.5 -mt-1 -mr-1.5 disabled:opacity-30"
            aria-label="Fechar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5">{form}</div>
      </div>
    </div>
  )
}
