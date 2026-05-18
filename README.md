# 🏆 Álbum Copa 2026

> Controle digital do álbum de figurinhas Panini da Copa do Mundo FIFA 2026™  
> **[→ Acesse em meualbumcopa26.vercel.app](https://meualbumcopa26.vercel.app/)**

---

## Sobre o projeto

Aplicação web **mobile-first** para colecionadores do álbum Panini Copa 2026. Marque suas figurinhas, acompanhe o progresso por seleção e grupo, gerencie repetidas, encontre possibilidades de troca com amigos e gere um PDF completo para levar à banca.

O projeto nasceu de uma necessidade real — controlar um álbum físico de forma prática — e evoluiu para uma PWA completa com autenticação, sincronização na nuvem e um sistema de trocas peer-to-peer.

---

## Desenvolvido com Claude Code

Este projeto foi construído majoritariamente através do **[Claude Code](https://claude.ai/code)**, o ambiente de desenvolvimento assistido por IA da Anthropic. As intervenções manuais em código foram pontuais — a grande maioria das decisões arquiteturais, implementações e refatorações foi escrita diretamente pelo assistente a partir de especificações em linguagem natural.

O processo envolveu:
- Definição de requisitos e regras de negócio em linguagem natural
- Revisão e validação das implementações geradas
- Feedback iterativo sobre UX, bugs e ajustes visuais
- Tomada de decisões de produto (o que implementar, o que descartar)

Isso demonstra como ferramentas de IA generativa podem acelerar significativamente o ciclo de desenvolvimento quando bem direcionadas — não substituindo o raciocínio do desenvolvedor, mas amplificando sua capacidade de entrega.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 📘 **Álbum completo** | 994 figurinhas — 48 seleções × 20 + FWC (20) + Coca-Cola (14) |
| ✅ **Marcar figurinhas** | Toque para coletar, toque longo para gerenciar repetidas |
| 📊 **Estatísticas** | Progresso por grupo, ranking de seleções, visão geral |
| 🔍 **Busca** | Encontre qualquer jogador, seleção ou número instantaneamente |
| 📄 **PDF de faltantes** | Uma página organizada por grupo, com bandeiras e repetidas |
| 🔄 **Sistema de trocas** | Gere um código de troca compartilhável e encontre matches com amigos |
| 🎴 **Confete + fanfarra** | Celebração ao completar uma seleção |
| 🔊 **Sons** | Pop ao coletar, fanfarra ao completar (toggle on/off) |
| 📱 **PWA** | Instalável no celular como app nativo (manifest + ícones) |
| ☁️ **Sync na nuvem** | Login Google opcional — dados sincronizados entre dispositivos |
| 🌗 **Temas** | Pro (escuro) e Light (claro) com persistência local |

---

## Stack técnica

### Frontend
- **[Next.js 14](https://nextjs.org/)** — App Router, SSG/SSR, rotas de API serverless
- **[TypeScript](https://www.typescriptlang.org/)** — tipagem estática em todo o projeto
- **[Tailwind CSS](https://tailwindcss.com/)** — estilização utilitária com tema customizado via CSS variables
- **[Zustand](https://zustand-demo.pmnd.rs/)** — gerenciamento de estado com middleware `persist` (localStorage)
- **[flag-icons](https://flagicons.lipis.dev/)** — bandeiras SVG estilo Panini

### Backend & Infraestrutura
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — endpoints serverless para sync do álbum
- **[NextAuth.js](https://next-auth.js.org/)** — autenticação com Google OAuth (JWT strategy)
- **[Supabase](https://supabase.com/)** — PostgreSQL com API REST auto-gerada
- **[Vercel](https://vercel.com/)** — deploy contínuo a partir do GitHub

### Bibliotecas de produto
- **[jsPDF](https://parall.ax/products/jspdf)** — geração de PDF client-side com layout customizado
- **[canvas-confetti](https://www.kirilv.com/canvas-confetti/)** — animação de confete ao completar seleções
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** — sons gerados programaticamente (sem arquivos de áudio)

### Qualidade
- **[Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/)** — 172+ testes unitários cobrindo dados, store, utilities e regras de negócio
- TDD aplicado em todas as features críticas

---

## Arquitetura

### Dados do álbum
Todas as 994 figurinhas são dados estáticos em TypeScript (`src/data/teams.ts`), carregados em build time. A estrutura real do álbum Panini foi mapeada:

```
N1  → Escudo (badge)
N2–N12  → 11 jogadores
N13 → Seleção (foto da equipe — paisagem)
N14–N20 → 7 jogadores
```

Fonte: [CNN Brasil — lista completa do álbum](https://www.cnnbrasil.com.br/esportes/futebol/copa-do-mundo/veja-todos-os-jogadores-que-estao-no-album-da-copa-do-mundo-2026/) validada contra o álbum físico.

### Estado do álbum
O Zustand com `persist` mantém o estado no `localStorage` sob a chave `copa26-album-v1`. A estrutura é um simples `Record<stickerId, { quantity: number }>`, onde `stickerId` segue o formato `{TEAM_CODE}_{NUMBER}` (ex: `BRA_3`, `FWC_1`, `CC_14`).

### Autenticação e sync (opcional)
Login é **estritamente opcional** — a aplicação funciona 100% sem conta. Ao fazer login com Google:

1. O hook `useSyncStore` aguarda a hidratação do Zustand (via `persist.onFinishHydration`)
2. Carrega os dados do Supabase e mescla com o localStorage
3. Após o primeiro sync, subsequentes carregamentos usam o Supabase como fonte de verdade
4. Toda mudança de figurinha dispara um debounce de 1.5s que sincroniza via `PUT /api/stickers`

A rota de API faz **full replace** (DELETE + INSERT) para garantir que remoções sejam persistidas corretamente — upsert simples não funcionava para figurinhas descolecionadas.

### Sistema de trocas
Cada usuário pode gerar um **código de troca** (JSON base64 URL-encoded) contendo suas figurinhas repetidas e faltantes, categorizadas em:
- `badge` — Escudos N1 (brilhantes)
- `photo` — Seleções N13 (raras)
- `player` — Jogadores comuns
- `special` — Seções FWC e Coca-Cola

O algoritmo de matching compara dois perfis e encontra interseções por categoria, com toggle para aplicar ou ignorar as regras de categoria.

### Geração de PDF
Layout de uma página com grid 3 colunas sincronizado em **bandas horizontais** — grupos A+E+I, B+F+J, etc. renderizados juntos para garantir alinhamento perfeito independente do número de figurinhas faltantes por time. Bandeiras reais via `flagcdn.com` (fetch paralelo com fallback para bolinha colorida).

---

## Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/igorcezatte/album-copa-2026.git
cd album-copa-2026

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais (Google OAuth + Supabase)

# Rode o servidor de desenvolvimento
npm run dev

# Rode os testes
npm test
```

O app funciona sem as variáveis de ambiente — login e sync ficam desabilitados, mas o álbum é 100% funcional via localStorage.

### Variáveis de ambiente necessárias (opcional)

| Variável | Onde obter |
|---|---|
| `NEXTAUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| `NEXT_PUBLIC_SUPABASE_URL` / chaves | [app.supabase.com](https://app.supabase.com) |

Rode o schema em `supabase/schema.sql` no SQL Editor do Supabase após criar o projeto.

---

## Estrutura do projeto

```
src/
├── app/                    # Rotas Next.js (App Router)
│   ├── api/stickers/       # PUT/GET sync com Supabase
│   ├── config/             # Configurações e reset do álbum
│   ├── faltantes/          # Lista de faltantes + PDF + compartilhar
│   ├── grupo/[id]/         # Seleções por grupo
│   ├── repetidas/          # Gerenciamento de repetidas
│   ├── selecao/[code]/     # Grid de figurinhas por seleção
│   ├── sobre/              # Sobre o app e o desenvolvedor
│   ├── especial/[code]/    # Seções FWC e Coca-Cola
│   ├── stats/              # Estatísticas do álbum
│   └── trocar/             # Sistema de trocas
├── components/             # Componentes reutilizáveis
├── data/teams.ts           # 994 figurinhas — dados estáticos
├── hooks/                  # useHydrated, useSyncStore, useTeamConfetti
├── lib/                    # auth.ts, supabase.ts
├── providers/              # AuthProvider, ThemeProvider
├── store/albumStore.ts     # Zustand store com persist
└── utils/                  # confetti, migration, pdf, search, share, sound, stats, syncBanner, theme, trade
```

---

## Contribuindo

Sugestões, bugs e melhorias são bem-vindos via [Issues](https://github.com/igorcezatte/album-copa-2026/issues) ou Pull Requests.

---

## Desenvolvedor

**Igor Cezatte** — Engenheiro de Computação apaixonado por tecnologia, construindo projetos nas horas vagas.

- GitHub: [@igorcezatte](https://github.com/igorcezatte)
- App ao vivo: [meualbumcopa26.vercel.app](https://meualbumcopa26.vercel.app/)

Se o app te ajudou e quiser retribuir, me pague um pacotinho de figurinhas ☕  
Chave PIX: `igormcezatte@gmail.com`

---

*Desenvolvido com [Claude Code](https://claude.ai/code) — Anthropic*
