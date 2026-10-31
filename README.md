# Model Boat Race Competition Platform

Configurable competition management platform for the Marine Institute at Memorial University. Initial foundation source is implemented; later scoring phases remain ahead.

## Current status

The reference workbook is now present and has been reviewed structurally and by formula. Its 10 worksheets and the confirmed Engineer's Award conflict are documented in [workbook findings](docs/workbook-findings.md). Historical records are not imported into the application.

The public site, admin/judge shells, Supabase authentication integration, initial RLS migration, competition creation/settings, and basic public information management are implemented. Scoring, full rubric configuration, assignments, and result publication are later phases. See [implementation status](docs/implementation-status.md) for exact boundaries and verification limits.

**Dependency installation is currently blocked by the managed environment's outbound npm restrictions.** No lockfile or successful framework build exists yet. Three dependency-free Node tests and the PostgreSQL migration/policy suite pass. Real Supabase integration and browser checks remain pending.

## Run locally

With Docker Desktop running, no host Node.js installation is required:

```powershell
docker compose up --build -d
```

Open http://localhost:3000. See [Docker Compose instructions](docs/docker.md) for Supabase configuration, dependency lockfile generation, health checks, logs, and stopping the website. Docker is unavailable in the current managed session, so container startup is not yet verified.

Or run directly with Node.js:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without Supabase configuration, public pages render honest empty states and staff pages display setup instructions. Follow [setup instructions](docs/setup.md) for database migrations, environment settings, and initial organizer provisioning. No service-role key is needed.

## Checks

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Optional isolated Windows PostgreSQL policy harness: `./scripts/test-database.ps1`. See setup documentation before running. [Deployment preparation](docs/deployment.md) covers Node/Docker hosting and outstanding checks.

## Planning documents

- [Architecture and proposed database schema](docs/architecture.md)
- [Pages and visual direction](docs/interface-plan.md)
- [Reference review and decisions needing confirmation](docs/reference-review.md)
- [Phased implementation and validation](docs/development-plan.md)

Architecture documents describe the full target model; only the initial foundation migration is implemented. No sample team, judge, award, formula, or date is an approved competition configuration.

## Intended stack

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Authentication, and PostgreSQL with Row Level Security. Install current stable dependencies and commit the generated lockfile before CI/deployment. Deployment targets a Node.js server or Docker without depending on one hosting provider.

Reference files and extracted historical data remain ignored by Git. Include the upcoming rubric/guideline in `reference/` when available; competition rules are never inferred from missing information.
