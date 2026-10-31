# Foundation implementation status

## Implemented source

- Next.js App Router/React/TypeScript application and Tailwind v4 PostCSS configuration.
- Responsive navy/white design, public homepage, about page, edition directory, edition overview, teams and team profiles, awards, stages, announcements, and honest result empty states.
- Supabase SSR email/password sign-in, sign-out, session refresh proxy, verified identity, portal selection, and competition-scoped admin/judge checks.
- Private-by-default competition creation through a transactional RPC; competition settings and public visibility.
- Adding team profiles and school display names, award descriptions, stages, and announcements; publishing/unpublishing their information.
- Initial SQL migration with RLS, explicit column grants, read-only memberships, restricted organizer provisioning, ownership boundaries, and transactional audit triggers.
- Judge workspace shell scoped to competition membership. No assignment or evaluation data tables yet.
- Setup/environment examples, PostgreSQL policy harness, read-only workbook extraction, and Node/Docker deployment preparation.
- Docker Compose website service with localhost binding, multi-stage image, non-root runtime, health check, build/runtime public configuration, and an optional dependency-lockfile tool. Startup instructions: docker.md. Docker itself is unavailable in the current session, so no image/container has been built or started yet.

## Verification completed

- Workbook inventory and representative formula dependency review across all 10 sheets; exact evidence in workbook-findings.md. No Excel rendering/recalculation.
- Three Node tests pass: scoped role access, internal redirects, and bounded slugs.
- Initial migration applies successfully to isolated PostgreSQL 14 with a minimal Supabase identity shim.
- Database tests pass for anonymous visibility, private child records, future/draft announcements, judge permissions, membership self-promotion prevention, cross-edition admin isolation, protected ownership columns, audit actor capture/tamper prevention, atomic competition creation, and unpublishing.

## Verification blocked or pending

- npm install: denied outbound registry access (`EACCES`). No dependencies or lockfile yet.
- Type checking, lint, Next.js production build, and visual/browser QA: cannot run before installation.
- Real Supabase Auth, session cookie refresh, PostgREST column grants, and deployed-origin behavior: require configured local/authorized Supabase and installed dependencies.
- Database tests use an identity shim and do not claim complete Supabase integration coverage.

## Next development steps

Complete dependency installation and framework checks first. Then finish Phase 2: editing/archiving teams and awards, shared school records, full configurable/versioned rubrics, scoring methods and validation, scheduling/timezone editing, and generated database types. Current school names are public display snapshots, not shared school/contact entities.

Phase 3 adds judge provisioning UI, assignments, score drafts/submission, concurrency protection, race models, and scoring arithmetic. Phase 4 adds calculation snapshots, special awards, approval, incomplete exceptions, and result publication. Phase 5 adds imports/exports and production hardening.

The foundation has no invented scoring defaults and does not implement result calculations. No 2025 team/judge/award is seeded. The Engineer's Award conflict, upcoming guidelines, score steps, race exception policies, ties, and rounding still need organizer decisions before a live scoring configuration is enabled.
