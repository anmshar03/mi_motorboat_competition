# Deployment preparation

Status: foundation source, not yet deployed. Dependency installation, framework build, and browser checks are pending because npm downloads are blocked in the development environment. Resolve those checks before deployment.

## Provider-independent Node deployment

1. Resolve stable dependencies with `npm install`, review versions, and commit package-lock.json. Subsequent builds use `npm ci`.
2. Run the unit tests, TypeScript check, lint, and production build from docs/setup.md. Run database policy tests on an isolated Supabase environment and exercise real Auth/PostgREST flows.
3. Configure the approved production Supabase project and apply the reviewed SQL migrations. Provision initial organizers privately. Do not seed historical teams or scores.
4. Configure the public URL and publishable key from `.env.example` in the hosting environment. Next.js browser-visible variables are build-time inputs. The present code uses its Supabase client on the server, but keep build and runtime configuration consistent.
5. Build with `npm run build`; run with `npm start` on a Node-compatible host. Alternatively use the supplied Dockerfile once package-lock.json exists. `next.config.ts` emits a standalone build.
6. Put the application behind HTTPS, configure the intended Auth URLs, and use a managed process/container supervisor. Test anonymous and authenticated access on the deployed origin.

For local Docker Compose, see [docker.md](docker.md). The Dockerfile bootstraps with `npm install` when no lockfile exists, then uses `npm ci` whenever a lockfile is present. Generate/review/commit the lockfile with the provided Compose tool before deployment. Compose passes Supabase public configuration at build and runtime, binds the website to localhost, and checks `/api/health`. Docker is unavailable in the current managed session, so the image and container startup are not yet verified. No hosting account or Site has been created. No repository, GitHub remote, secrets, or production data have been provisioned by this work.

## Production acceptance checks

- An anonymous user sees only public editions and public records inside them; private rows remain inaccessible through direct database API calls.
- Judges cannot read private teams without a future explicit assignment policy, edit competition information, or grant themselves roles.
- Competition admins cannot update another edition or change identity/ownership columns through the API.
- Creating a competition records ownership and audit events atomically.
- Unpublishing an edition removes public access to its child records; public result/competition reads are uncached in this release.
- Login, logout, invalid credentials, revoked memberships, and network failures behave correctly with real Supabase Auth.
- Desktop/tablet/mobile and keyboard flows are reviewed; contrast and assistive-technology checks are completed.

Competition scoring, assignments, rubric versioning, race entry, approval/publishing of calculated results, imports/exports, and full operational readiness are later phases. Do not use the foundation release to record live judge evaluations.

## Operational decisions before live use

Confirm the approved hosting/data region, who owns the Supabase project, email delivery, backup retention, access removal process, student profile publication rules, and restore responsibility. Schedule backups appropriate to the approved environment and verify a restoration in a separate project. Never deploy the local test Auth shim or its trust-authenticated PostgreSQL cluster.
