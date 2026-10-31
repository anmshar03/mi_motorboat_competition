# Phased development and validation

## Pre-implementation checkpoint

Architecture/schema and interface proposals have been delivered. The workbook is now inspected; see workbook-findings.md for exact worksheet/formula evidence. Organizer decisions for the new edition remain open. Foundation implementation has begun without encoding disputed historical rules; see implementation-status.md for verification and phase boundaries.

## Phase 1 — Foundation

Scaffold current stable Next.js, React, TypeScript, and Tailwind with a committed lockfile. Create public/admin/judge shells, responsive navigation, accessible components, and honest empty states. Add Supabase SSR authentication, invitation-based access, competition memberships, and RLS migrations for the initial entities. Document `.env.example`, local setup, migrations, and initial administrator provisioning.

Acceptance: a clean checkout starts locally; unauthenticated requests cannot access private data; judges cannot access admin actions; navigation reflects verified roles; switching competitions cannot reveal unauthorized data. Verify type checking, linting, production build, authentication flows, and initial direct RLS tests. Auth requires local Supabase or authorized project configuration; a visual shell alone does not count as working authentication.

## Phase 2 — Competition management

Add competition, school/team, stage, award, rubric/version, and scoring-configuration CRUD with incremental migrations. Provide rubric preview, scale validation, method-specific weight validation, version locking, and safe archival. Annual copy creates new IDs and copies only explicitly selected configuration; never copy scores, judges, teams, or publication state silently.

Acceptance: independent editions retain independent data; invalid bounds and cross-year relationships fail at the database boundary; used rubrics cannot change in place; an additional guideline can be configured without code changes within supported methods.

## Phase 3 — Judging and races

Add invitations, assignments, criterion score entry, drafts/submission, optimistic concurrency, immutable revisions, calculation methods, race events/rounds, and raw finish results. Add the appropriate audit trail with each mutation; do not postpone audit capture until Phase 5.

Acceptance: judges can edit only their authorized drafts; partial drafts remain null where unanswered; submission validates all required data atomically; conflicting edits produce a recoverable conflict; retries do not duplicate submissions. Test configured numeric boundaries, fractional scores, expected judge completeness, normalization methods, race denominators, ties, DNS/DNF/DQ policies, and zero entrants. Unknown policies block calculation rather than inventing points.

## Phase 4 — Approval and publication

Add approval/reopening, versioned calculation runs, special award composition, optional configured overall results, publication preview, explicit incomplete overrides, public snapshots, and publish/unpublish. Add Realtime only if it helps refresh published snapshots and passes authorization checks.

Acceptance: anonymous API queries cannot retrieve unpublished scores or private feedback; a score changed after calculation prevents stale publication; simultaneous edits/publication remain consistent; unpublishing revokes database reads; historical snapshots remain reproducible; missing scores never become zero. Test these at database and end-to-end levels.

## Phase 5 — Reporting and production preparation

Add a documented XLSX/CSV import template and exports where practical. Preview import mappings and errors, scope rows to one competition, validate before committing, and preserve audit provenance. Protect exports against spreadsheet formula injection. Expand audit viewing, responsive/accessibility QA, backups/restoration guidance, deployment documentation, and operational checks. Prefer explicit supported input formats over guessing arbitrary historical workbook layouts.

Acceptance: imports fail safely with row-level errors; exports reconcile with source revisions/publication snapshots; a fresh environment applies all migrations; production build and role/security suites pass; backup restoration is exercised in a nonproduction environment. Confirm approved hosting, identity provisioning, and organizer rules before live use.

## Test priorities

Focus tests on meaningful risks: scoring arithmetic, missingness, publication gates, revision/concurrency behavior, cross-competition integrity, and RLS. Use deterministic synthetic fixtures clearly labeled as test data. Once the reference is available, add representative historical regression cases only for calculations explicitly verified and approved; do not encode disputed rules as expected behavior.

Each phase ends with working scope, verification evidence, known limitations, and updated setup documentation. Avoid presenting placeholders for later phases as completed features.
