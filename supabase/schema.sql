-- Álbum Copa 2026 — Schema Supabase
-- Rodar no SQL Editor do painel Supabase
--
-- Histórico:
--   v1: estrutura inicial (user_id, sticker_id, quantity, updated_at)
--   v2: adiciona collected_at (timestamp da primeira coleta) e removed_at
--       (soft-delete) — habilita histórico por figurinha e blindagem contra
--       perda catastrófica de dados no sync.

CREATE TABLE IF NOT EXISTS sticker_entries (
  user_id      TEXT        NOT NULL,   -- Google sub ID via NextAuth
  sticker_id   TEXT        NOT NULL,   -- formato "BRA_3", "FWC_1", "CC_14"
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at   TIMESTAMPTZ,
  PRIMARY KEY (user_id, sticker_id)
);

-- Migração v1 → v2 (idempotente; pode ser rodada várias vezes sem efeito)
ALTER TABLE sticker_entries
  ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE sticker_entries
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

-- Index para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_sticker_entries_user_id
  ON sticker_entries (user_id);

-- Index parcial para queries de "figurinhas ativas" (removed_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_sticker_entries_active
  ON sticker_entries (user_id)
  WHERE removed_at IS NULL;

-- Sem RLS: acesso controlado via service_role_key nas API routes do Next.js
-- (a sessão NextAuth é verificada antes de qualquer query Supabase)

-- ─── Perfis de usuário ──────────────────────────────────────────────
--
-- NextAuth usa JWT (não persiste sessões em DB), então não temos onde olhar
-- "qual o email do user X". Esta tabela é populada via upsert em /api/stickers
-- a cada GET/PUT — primeira interação após login do user já registra seu
-- email/nome. Usada pelo painel admin pra listar usuários por algo legível.
--
-- v3: adiciona user_profiles (idempotente)

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       TEXT        PRIMARY KEY,           -- Google sub ID
  email         TEXT,
  name          TEXT,
  image_url     TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen
  ON user_profiles (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON user_profiles (email);

-- ─── Contas locais (apelido + senha) ────────────────────────────────
--
-- Método de login alternativo ao Google: apelido escolhido pelo usuário +
-- senha hasheada com bcryptjs. Pensado pra quem não tem ou não lembra a
-- conta Google. Sem confirmação de email, sem recuperação — "perdeu, perdeu".
--
-- O user_id é UUID gerado no banco (não colide com Google sub IDs, que
-- são numéricos como strings). sticker_entries.user_id é TEXT e aceita
-- ambos sem alteração.
--
-- v4: adiciona local_accounts (idempotente)

CREATE TABLE IF NOT EXISTS local_accounts (
  user_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username_lower TEXT        NOT NULL UNIQUE,
  username       TEXT        NOT NULL,
  password_hash  TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_local_accounts_username_lower
  ON local_accounts (username_lower);
