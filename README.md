# Papilote

Plateforme web de préparation aux concours **EOPAN**, **EOPN** et **ALAT** — cours, tests psychotechniques, quiz et schémas interactifs.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · TanStack Table · React Hook Form + Zod · Recharts · React Flow · Fuse.js

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000
```

## Qualité

```bash
npm run check        # lint + typecheck + format + tests unitaires
npm run test:e2e     # tests Playwright (desktop + mobile)
npm run build        # build de production
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack, structure, décisions
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — journal des modifications
- [`docs/components.md`](docs/components.md) — catalogue des composants partagés
- [`AGENTS.md`](AGENTS.md) — règles de projet (Claude Code)
- `.claude/skills/` — 10 skills spécialisées chargées automatiquement par Claude Code
