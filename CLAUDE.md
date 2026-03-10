# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Next.js on port 3000)
npm run build     # Production build
npm run lint      # ESLint
npx prisma studio # Open Prisma DB GUI
npx prisma db push     # Push schema changes to dev SQLite DB
npx prisma generate    # Regenerate Prisma client after schema changes
```

No test suite is configured in this project.

## Architecture

Syntix is a **Next.js 16 App Router** application — a startup idea analysis platform. Users input business ideas which are processed by Google Gemini AI through a structured 3-phase workflow.

### Route Groups

- `app/(authenticated)/` — Protected routes (redirects to `/` if no session). Contains `/app/idea/[id]` (the main workspace), `/app/ladder`, `/leaderboard`.
- `app/(public)/` — Unauthenticated routes. `/arena` shows public ideas; `/idea/[id]` is the public view.
- `app/admin/` — Admin panel for managing users and ideas (role-checked separately).
- `app/api/` — API routes: NextAuth handler, backfill utilities, status check.

### The 3-Phase Idea Workflow

The core workspace (`WorkspaceClient.tsx`) has three tabs:

1. **Ideation** (`IdeationTab`) — User selects an "input channel" (Pain-Storming, Technology, Market Demands, External Shocks, or Direct Input). AI generates a concept pitch via `actions/ideation.ts` (Gemini 2.0 Flash), which auto-saves title + rawText to DB and triggers thumbnail generation.

2. **Inception / Refinement** (`InceptionTab`) — AI classifies the idea into one of 5 archetypes (`InceptionPath`: cash_cow, cash_farm, new_meat, ozempics, dead_end) and produces a full market research + strategy roadmap. See `types/inception.ts` for the full shape.

3. **Stress Test / Pitch Ready** (`PitchReadyDashboard`) — "The Auditor" AI (`TheAuditor` component, `actions/analyze-idea.ts`) generates an IRL score (0–100), 6-axis radar chart data, and detailed metric scores. `TheRadar` and `IRLScore` components render these. Results can be published to the Arena.

### Server Actions Pattern

All AI calls and DB writes are Next.js Server Actions (`"use server"`) in `app/actions/`. Key files:
- `ideation.ts` — Gemini concept generation
- `analyze-idea.ts` — "The Auditor" IRL scoring
- `classify-idea.ts` — Inception archetype classification
- `publish.ts` — Toggles `isPublic`, saves `irlJson`, `thesisText`, title
- `generate-image.ts` — AI thumbnail generation
- `collaborate.ts`, `vote.ts`, `comment.ts` — Social features

### Database

SQLite via Prisma (dev). Key models:
- `User` — NextAuth standard + `role` field (`GUEST | USER | ADMIN`)
- `Idea` — Central model; stores `rawText`, `refinementJson` (Inception strategy JSON string), `irlJson` (IRL scores JSON string), `archetype`, `thumbnailUrl`, `isPublic`
- `Vote`, `Comment` — Community interaction on public ideas
- `Ladder` — Network/relationship canvas data (nodes/edges JSON)

After schema changes: `npx prisma db push && npx prisma generate`

### Auth

NextAuth v4 with two providers:
- **Google OAuth** — Production login
- **Credentials (Callsign)** — Dev/demo login: any username creates a `@syntix.local` user

JWT strategy; role is fetched from DB on every JWT callback to keep it fresh.

### State & Contexts

Client-side React contexts (no Redux/Zustand):
- `GamificationContext` — XP, levels, achievements; persisted to `localStorage`
- `LanguageContext` — `pt | en` toggle; translations in `lib/translations.ts` + `messages/` JSON files
- `DeviceContext` — Tracks viewport for device-aware rendering

### UI

- Dark theme; primary color `#FF6B00` (orange), background `#0A0A0A`
- Tailwind CSS v4 + `tailwindcss-animate`; custom color tokens under `syntix.*`
- Material Symbols icons (loaded via HTML `<link>` in layout, used as `<span className="material-symbols-outlined">icon_name</span>`)
- Framer Motion for animations
- Recharts for the radar chart (`TheRadar`)
- PDF export via `jsPDF` + `jspdf-autotable` (`lib/pdf-generator.ts`)

### Environment Variables Required

```
DATABASE_URL              # SQLite path, e.g. file:./dev.db
GOOGLE_GEMINI_API_KEY     # For all AI features
GOOGLE_CLIENT_ID          # NextAuth Google provider
GOOGLE_CLIENT_SECRET      # NextAuth Google provider
NEXTAUTH_SECRET           # NextAuth JWT secret
NEXTAUTH_URL              # e.g. http://localhost:3000
```
