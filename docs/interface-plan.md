# Proposed pages and design

## Visual direction

Use a navy identity with white surfaces, light grey page backgrounds, restrained blue accents, and generous spacing. Candidate design tokens: navy `#102C46`, blue `#175CD3`, background `#F5F7FA`, body text `#172B3A`. Confirm contrast for every text/state pairing during implementation. Green, amber, and red statuses always include text and, where helpful, an icon; color alone never communicates state.

Use system sans-serif typography initially. Public pages can use an abstract wave/race-lane motif; official Memorial University and Marine Institute assets require supplied or approved branding. No invented competition dates, sponsors, team identities, statistics, or winners.

Public navigation uses a compact header and competition selector. Admin uses a desktop sidebar, competition context, breadcrumbs, and a drawer on smaller screens. Judge navigation stays minimal and prioritizes unfinished assignments. Mobile forms use one column; wide tables have labeled horizontal scrolling or focused card views. Keyboard focus, form labels, inline errors, readable status text, and touch-sized targets are required. Aim for WCAG 2.2 AA and verify, rather than claim, compliance.

## Route structure

| Interface | URL under its root | Purpose |
| --- | --- | --- |
| Public | `/` | Competition directory/current edition entry point |
| Public | `/competitions/[slug]` | Approved introduction, announcements, next published stage |
| Public | `/competitions/[slug]/about` | Competition information and approved guidelines |
| Public | `/competitions/[slug]/teams` | Published team directory |
| Public | `/competitions/[slug]/teams/[teamId]` | Approved profile and published results |
| Public | `/competitions/[slug]/leaderboard` | Configured published standings; no inferred overall winner |
| Public | `/competitions/[slug]/awards` | Approved award descriptions and published standings |
| Public | `/competitions/[slug]/races` | Published race results, positions, statuses, and points |
| Public | `/competitions/[slug]/stages` | Published stages and schedule |
| Public | `/competitions/[slug]/announcements` | Published updates |
| Auth | `/login` | Judge/admin sign-in and recovery flow |
| Admin | `/admin` | Authorized competition selection |
| Admin | `/admin/competitions` | Create/manage competitions |
| Admin | `/admin/competitions/[id]` | Dashboard with incomplete setup, scoring progress, publication tasks |
| Admin | `/admin/competitions/[id]/teams` | Schools, teams, and approved public profile fields |
| Admin | `/admin/competitions/[id]/awards` | Award definitions and versioned rubric editor |
| Admin | `/admin/competitions/[id]/stages` | Stages and schedule management |
| Admin | `/admin/competitions/[id]/judges` | Judge invitations and memberships |
| Admin | `/admin/competitions/[id]/assignments` | Judge × team × award assignment management |
| Admin | `/admin/competitions/[id]/scores` | Draft/submitted/approved review and reopening |
| Admin | `/admin/competitions/[id]/races` | Events, rounds, entries, results, and policies |
| Admin | `/admin/competitions/[id]/results` | Calculation breakdown, approval, publication preview, publish/unpublish |
| Admin | `/admin/competitions/[id]/reports` | Permission-checked exports |
| Admin | `/admin/competitions/[id]/history` | Filterable audit history |
| Admin | `/admin/competitions/[id]/settings` | Competition details, memberships, visibility, and configuration |
| Judge | `/judge` | Authorized competition selection |
| Judge | `/judge/competitions/[id]` | Assignment progress and next evaluation |
| Judge | `/judge/competitions/[id]/assignments` | Assigned teams and awards only |
| Judge | `/judge/competitions/[id]/evaluations/[assignmentId]` | Guideline, criteria, validated score entry, draft save and submit |
| Judge | `/judge/competitions/[id]/saved` | Draft evaluations |
| Judge | `/judge/competitions/[id]/submitted` | Own submitted evaluations, read access according to policy |

## Primary interactions

Judge score entry displays competition/team/award context, the locked guideline version, criterion descriptions, scoring limits, required indicators, and clear save state. Leave every score empty initially. Provide explicit Save draft and Submit evaluation actions; warn about unsaved changes. Submission confirms successful persistence and validation, never just a local state change.

Rubric editing previews the judge's form, highlights invalid scales/weights, and explains locking/versioning. Do not expose formula code as the normal configuration interface. Use method selectors and labeled parameter fields.

Results review shows expected versus approved assignment counts, missing inputs, configuration version, calculation breakdowns, and source freshness. A public preview displays the exact snapshot proposed for publication. Incomplete overrides require an intentional action and reason.

Dashboards use a small number of actionable counts and task lists. Avoid decorative charts. Empty states explain the next action without fabricating sample records. Public standings always show publication time and distinguish provisional/incomplete publications from final results.
