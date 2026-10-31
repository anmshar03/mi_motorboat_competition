# Development setup

## Prerequisites and verification status

Use Node.js 24 LTS (the development host has 24.13.0), npm, and a local or hosted Supabase project. The initial migration and access-policy tests were executed successfully using an isolated local PostgreSQL 14 cluster with a minimal Supabase identity shim. This does not replace Supabase Auth/PostgREST integration testing.

Outbound npm downloads were denied by the managed development environment (`EACCES`). Dependencies could not be installed, so no lockfile has been generated and TypeScript, ESLint, Next.js build, and browser verification have not run. `latest` in package.json is only the initial stable-release bootstrap specification. Resolve it once using the install below, review installed versions, and commit the generated package-lock.json before reproducible CI or deployment. Do not treat this source as production-verified.

## Install and start

From the project directory in a terminal that can access the npm registry:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. The public site can render empty states without database configuration. Staff pages show setup instructions until the Supabase variables are present; they never bypass authentication or expose a simulated logged-in account.

For live competition management, complete the database steps and restart the development server. Run the checks before using live data:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

The standalone Node tests require Node's TypeScript stripping support and use no installed packages. There are currently three tests covering role isolation, redirect safety, and slug validation.

## Supabase project

Use an authorized project or create a local Supabase environment. For local Supabase, install its CLI and the required container runtime according to the official instructions, then use `supabase init` and `supabase start`. The existing `supabase/migrations/` directory is the source of schema history; do not overwrite it. Supabase local tooling can require substantial downloads and was not provisioned in this session.

Apply `supabase/migrations/202610310001_foundation.sql` through your migration process. For a linked project, verify the intended project reference before `supabase db push`; alternatively apply the migration through that project's SQL editor. Do not run application migrations against an unrelated database.

Copy the Supabase URL and publishable key from the project API settings to:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For local Supabase, use the local API URL and corresponding public key reported by the CLI. The application does not need a service-role key. Do not add one to browser-visible environment variables. Public key safety depends on the supplied RLS policies and restrictive table grants.

Disable public self-signup in Supabase Auth. Use email/password Auth users provisioned by an authorized organizer through the Supabase dashboard for this foundation release. Password recovery UI and invitations will follow in a later phase; organizers must handle recovery through their configured Auth administration workflow for now. Set Site URL and allowed redirect URLs to the intended application origin for any Auth email flows you enable.

## First platform organizer

Create the initial Auth user with a secure password through the Supabase dashboard. Copy that user's ID and run the following in an authorized SQL administration session:

```sql
insert into public.platform_organizers(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID');
```

The platform-organizer capability allows creating competitions. It does not automatically grant access to every other competition. The `create_competition` RPC creates a private edition and its creator's admin membership in one transaction.

Sign in at `/login`, open the organizer portal, and create an edition. Add team profiles, award descriptions, stages, and announcements. Each item and the competition itself must be public before anonymous visitors can see the item.

## Additional administrators and judges

Provision another Auth user, then add the appropriate competition-scoped membership in an authorized SQL administration session:

```sql
insert into public.competition_memberships(competition_id, user_id, role)
values ('COMPETITION_UUID', 'AUTH_USER_UUID', 'judge');
-- Use 'admin' for a competition administrator. A user can hold both roles
-- through separate rows if that is an explicitly authorized organizer choice.
```

The UI cannot mint permissions or invite users yet. Only authenticated users can enter portals; RLS and server checks enforce each membership. Judges currently see their authorized competition workspaces, with assignment and scoring workflows explicitly marked as upcoming.

Remove memberships through an authorized administration session to revoke competition access. Server requests check current database memberships rather than relying on a role embedded in an old browser token. Membership changes are audited.

## Database policy tests

Against disposable Supabase with the migration applied:

```powershell
psql YOUR_DISPOSABLE_SUPABASE_DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/foundation.sql
```

Tests create synthetic Auth IDs and roll back all fixture data. Run only in an isolated test environment.

For the Windows standalone policy harness used during development:

```powershell
./scripts/test-database.ps1 -PostgresBin 'C:/Program Files/PostgreSQL/14/bin'
```

The harness creates a cluster under `.cache/postgres/data`, binds to 127.0.0.1:55439, and tests a dedicated `boat_platform_test` database. It never connects to an existing PostgreSQL service. It creates a small Auth compatibility shim; it does not emulate Supabase's email, JWT transport, or PostgREST behavior. It uses trust authentication inside this isolated development cluster and shuts it down after the test. Never expose that cluster on a public interface.

## Workbook reference

```powershell
./scripts/inspect-workbook.ps1
```

The script reads the original XLSX ZIP/XML without editing it and saves private extracted data under `.cache/`. It preserves formula text and array anchors. It does not render or recalculate Excel formulas. Findings and exact formula references are recorded in [workbook-findings.md](workbook-findings.md).
