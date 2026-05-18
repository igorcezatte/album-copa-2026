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
