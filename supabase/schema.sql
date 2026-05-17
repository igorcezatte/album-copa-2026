-- Álbum Copa 2026 — Schema Supabase
-- Rodar no SQL Editor do painel Supabase

CREATE TABLE IF NOT EXISTS sticker_entries (
  user_id     TEXT        NOT NULL,   -- Google sub ID via NextAuth
  sticker_id  TEXT        NOT NULL,   -- formato "BRA_3", "FWC_1", "CC_14"
  quantity    INTEGER     NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, sticker_id)
);

-- Index para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_sticker_entries_user_id
  ON sticker_entries (user_id);

-- Sem RLS: acesso controlado via service_role_key nas API routes do Next.js
-- (a sessão NextAuth é verificada antes de qualquer query Supabase)
