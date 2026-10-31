# Proposed architecture

Status: target architecture proposal, informed by the completed historical workbook review. The initial foundation subset is implemented in `supabase/migrations/202610310001_foundation.sql`; the full scoring model below is not yet implemented. See implementation-status.md for exact phase boundaries.

## Application boundaries

Use one Next.js application with separate public, admin, and judge layouts. Server Components load data; client components handle interactive forms. Server actions or route handlers validate mutations and call domain services. Every entry point checks identity and competition membership; hidden navigation is not authorization.

Supabase provides authentication, PostgreSQL, and optional Realtime. Use cookie-based SSR authentication and verified claims according to the installed SDK's official guidance. PostgreSQL RLS independently protects tables. Keep scoring logic in a framework-independent domain module; persist authoritative calculation runs transactionally through a narrow database API. Never trust browser-calculated totals.

```text
src/
  app/
    (public)/competitions/[competitionSlug]/
    (auth)/login/
    (admin)/admin/competitions/[competitionId]/
    (judge)/judge/competitions/[competitionId]/
  components/{ui,public,admin,judge}/
  features/{competitions,teams,rubrics,assignments,scoring,races,publishing}/
  domain/{scoring,validation,permissions}/
  lib/{supabase,auth}/
supabase/{migrations,tests}/
tests/{unit,integration,e2e}/
docs/
reference/
```

Route groups do not contribute URL segments. Each competition uses an explicit identifier; never choose a private data scope solely from a client-side 'current year' selection.

## Relational model

Unless indicated otherwise, entities have UUID primary keys and timestamps. Competition-owned entities carry a non-null `competition_id`. Every relationship between competition-owned entities uses a composite foreign key including `competition_id`, backed by a corresponding unique key. This prevents attaching one year's team to another year's assignment or race even if application validation fails.

| Table | Main fields and relationships |
| --- | --- |
| competitions | Unique slug, title, edition label/year, dates, timezone, lifecycle, approved public information; year need not be unique |
| schools | Shared school identity and administrative contact fields; private by default |
| competition_schools | Competition and school FK; approved display name snapshot and public visibility |
| teams | Competition, competition-school link, display name, code, approved public profile fields; unique code per competition |
| profiles | User ID FK to `auth.users`, display name; no public email access |
| roles | Supported permission roles such as admin and judge; scoring categories are unrelated |
| competition_memberships | Competition, user, role FK; unique competition/user/role; managed only by authorized administrators |
| judges | Competition and user membership identity, active state; unique competition/user; no duplicated credentials |
| stages | Competition, title, display order, optional schedule, visibility |
| awards | Competition, optional stage, title, description, active rubric version, visibility; no built-in award names |
| rubric_versions | Award, version number, draft/locked/retired state, guideline text; unique award/version |
| rubric_sections | Rubric version, title, description, display order |
| criteria | Section and rubric version, label, description, required flag, numeric bounds, step/allowed scale values, weight, feedback policy |
| scoring_configurations | Award/rubric version, versioned method and validated parameters; normalization, aggregation, missing values, rounding, ranking policy |
| award_components | Special award configuration, source award, weight, explicit normalization; unique source per configuration; dependency cycles prohibited |
| judge_assignments | Competition, judge, team, award, locked rubric version, required flag, active state; unique active assignment tuple |
| score_submissions | Assignment, revision, draft/submitted/approved state, optimistic-lock version, submitted/approved timestamps and actors; unique assignment/revision |
| criterion_scores | Submission, criterion, nullable numeric score and feedback; unique submission/criterion; criterion must belong to assigned rubric |
| submission_events | Submission transition/reopening reason, actor, timestamp; append-only |
| race_events | Competition, optional stage, name, type, scoring configuration, lifecycle |
| race_rounds | Event, optional predecessor round, label, order; bracket-specific advancement remains future configuration |
| race_participants | Round and team; unique round/team |
| race_results | Participant, raw placement, tie group, finish status, revision, approval metadata; numeric points derived separately |
| calculation_runs | Competition, config version, source revision manifest/hash, creator, completeness, calculation time; immutable |
| calculated_award_results | Run, award, team, nullable numeric score/rank, completeness and calculation breakdown; unique run/award/team |
| calculated_race_results | Run, participant, source result revision, nullable numeric points and breakdown |
| publication_batches | Competition, calculation run, publication state, approver/publisher, timestamps, optional incomplete-override reason |
| published_results | Batch and immutable public team/award/race snapshots; no judge identity, feedback, or raw private submissions |
| announcements | Competition, title, body, draft/published state, publication time |
| audit_logs | Competition, actor, operation, entity type/ID, safe before/after data, reason, timestamp; append-only |

Exact columns, enum representations, and ownership constraints will be finalized in incremental migrations. A conceptual configuration table must not become an unvalidated JSON escape hatch: stable relationships use FKs, supported method parameters use strict schemas, and database operations enforce valid versions.

## Integrity, indexing, and history

- Use PostgreSQL `numeric` for scores and weights. Define allowed bounds, steps, and precision explicitly; avoid floating-point comparisons for ties.
- Check bounds and weights locally; validate cross-row invariants such as weight sums in a transaction when locking a rubric. The target sum depends on the configured method.
- Enforce same-rubric criterion membership and score bounds at the database write boundary, including direct API access.
- Index foreign keys and frequent queries: membership by user/competition, assignments by judge/state, submissions by assignment/state, publications by competition/state, and audit records by competition/entity/time.
- Restrict deletion of records referenced by scores, locked configurations, runs, or publications. Archive rather than destroying historical competitions.
- Locked rubric and scoring versions are immutable once used. Corrections create revisions and invalidate pending approvals derived from older inputs.
- Historical team/school display information is snapshotted for publication, so future renaming does not silently rewrite a published edition.

## Scoring contract

Methods are a registry of supported, versioned calculations: criterion weighting, total points, judge average, race placement, and award composition. Administrators configure parameters, not executable SQL or JavaScript. If later needed, a restricted expression language can support additional arithmetic after a separate validation and security review.

Every calculation returns `score: decimal | null`, completeness, source versions, and a breakdown. Missing values remain null. A display of 'awaiting scores' must not participate in ranking as zero.

Normalize criteria according to an explicit configured rule. For example, `score / maximum` and `(score - minimum) / (maximum - minimum)` differ for a 1–5 scale; neither is selected from the brief. Also configure whether weighted criterion aggregation precedes judge averaging, and how optional criteria affect the denominator. Do not silently normalize unequal weights or drop missing judges.

Expected assignments determine completeness. Track assignment progress as not started, draft, submitted, or approved. Publication is a separate state on a result snapshot, not a mutation that makes raw judge submissions public. Admin-controlled reopening creates an auditable revision. Special awards depend on explicit component awards, normalization, and combination method; reject circular dependencies. An overall leaderboard requires its own explicit configuration.

Race positions, statuses, and calculated points remain separate. The supplied historical placement formula may become a configurable preset only after its denominator and exceptional finish policies are specified. Ties do not imply a particular ranking or shared-points convention.

## Concurrency and publication

Save drafts with optimistic concurrency using an expected revision/version; return a clear conflict if another tab has changed the evaluation. Submit all criterion scores and the state transition atomically. Require server-side completeness checks and use idempotency keys for retried commands.

Approval and publication execute in database transactions under a competition-scoped lock or equivalent isolation. Verify all source revisions and config versions match the calculation run before publication. A stale run cannot be published. Ordinary mutations must follow the same locking/version protocol so a new score cannot race past that check.

Public queries read only an active immutable publication snapshot. Updating a draft or approved score never leaks it to public readers. An incomplete exception requires an admin permission, explicit override, reason, and public incomplete label; missing values stay absent. Unpublishing atomically revokes anonymous reads of that batch. Begin with uncached public result reads so unpublishing is immediately effective; any later caching must have explicit revocation semantics. Copies already downloaded by spectators cannot be revoked.

Realtime, if introduced, announces only public publication changes or permitted private assignment updates. It must not broadcast raw scores to anonymous clients.

## Security model

- Anonymous readers can access only explicitly published public content and active publication snapshots. Source scoring and membership tables remain private.
- Judges read active assignments, necessary rubric/team details, and their own evaluations. Judges cannot change assignment ownership, approve results, or update another judge's scores.
- Competition administrators manage their authorized competition only. Do not infer global access from a role in one edition.
- Protect both RLS `USING` and `WITH CHECK` paths. RLS row ownership alone does not restrict protected columns or status transitions; use narrow transactional functions and restrictive grants for sensitive writes.
- Profile updates cannot modify memberships or permissions. Invitation/provisioning endpoints must recheck authorization.
- Use invoker-security functions by default. Any necessary definer function uses a fixed search path, restricted execute grants, and explicit identity/competition checks.
- Write audit events in the same transaction as changes. No client may update/delete audit records. Keep secrets and unnecessary personal data out of logs.
- Never expose a Supabase service-role/secret key in browser code. Prefer user-scoped database access; privileged provisioning, if required, stays in an isolated server-only module.
- Test database policies directly with anonymous, judge, admin, and cross-competition identities rather than assuming protected pages secure the data API.

## Portability and operational setup

Keep schema changes as versioned SQL migrations and generated database types in source control. Keep deployment independent of Sites or another proprietary hosting runtime. Use a Node.js/Docker-compatible Next.js build and environment configuration for Supabase endpoints, publishable key, application origin, and any isolated server secret.

At implementation, document local Supabase setup, migrations, authorized initial-admin provisioning, auth redirect URLs, email delivery, backups/restoration, and production configuration. A clean checkout should support local development without production credentials. Verify the approved hosting region and institutional requirements before deployment.

## Official implementation references

- Next.js App Router: https://nextjs.org/docs/app
- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Supabase SSR authentication: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

Consult current documentation and registry versions again when scaffolding; no dependency version has been selected or installed during planning.
