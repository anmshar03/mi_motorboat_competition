# Run the website with Docker Compose

## Host requirements

Install and start Docker Desktop with Linux containers and Compose v2, or use Docker Engine with the Compose plugin on Linux. Node.js and npm are not needed on the host. Docker must be able to pull `node:24-alpine` and download dependencies from the npm registry during the first build.

This development session could not launch Docker: no Docker CLI was available on PATH or at the standard Windows installation path, and WSL enumeration returned access denied. The configuration below is prepared, but the image build, Compose validation, container startup, and browser access have not been verified here.

## Start

In the project directory:

```powershell
docker compose up --build -d
docker compose ps
```

Open **http://localhost:3000**. The service binds to localhost only. The first build installs dependencies, runs tests/type checking/lint, and builds the Next.js standalone server. Startup will fail if any required build check fails; inspect the reported error before continuing.

No environment file is required to view the public layout. Without Supabase settings, the website shows competition empty states and the staff portal shows setup instructions. Docker runs the website; it does not create a Supabase database, Auth accounts, or sample competition records.

## Supabase configuration

Follow [setup.md](setup.md) to configure an authorized Supabase project, apply the migration, and provision the first organizer. Create `.env` for Compose if it does not already exist:

```powershell
Copy-Item .env.example .env
```

Set the Supabase URL and publishable key in `.env`, then rebuild:

```powershell
docker compose up --build -d
```

Compose reads `.env` by default. Existing host-only development settings can instead be used explicitly:

```powershell
docker compose --env-file .env.local up --build -d
```

Use the same environment-file option for later Compose commands when needed. Variables are explicitly passed as build arguments and runtime environment values; `.env` and `.env.local` are excluded from the image context. Rebuild after changing `NEXT_PUBLIC_*` values because Next.js can embed them at build time. These must be the **publishable** project values, never a service-role credential.

If Supabase runs on the Windows/macOS host, `localhost` inside the website container refers to that container. Use the local Supabase API address reachable through `host.docker.internal` instead. A separate plain PostgreSQL container cannot replace Supabase Authentication or its API.

## Reproducible dependency installation

There is currently no package-lock.json because the original host could not download dependencies. The Docker build supports this initial state with `npm install` inside its dependency stage. To resolve and save the lockfile into the checkout using Docker before building:

```powershell
docker compose --profile tools run --rm lockfile
docker compose up --build -d
```

Review and commit the generated package-lock.json. Subsequent builds use `npm ci`; the optional tool does not start with the website. The tool mounts the project to write the lockfile and does not install host node_modules. It may update the lockfile if run again after dependency changes.

## Everyday commands

```powershell
# Logs and health
docker compose logs --tail 100 -f web
docker compose ps
Invoke-RestMethod http://localhost:3000/api/health

# Rebuild after source changes
docker compose up --build -d

# Stop / restart without rebuilding
docker compose stop
docker compose start

# Remove the app container and Compose network
docker compose down
```

The `/api/health` endpoint reports application liveness, not database readiness. The image runs as an unprivileged user with a process init and bounded container logs. There are no project bind mounts in the running web service and no automatic source reload; rebuild after changing application code.

## Another host port

Set `WEB_PORT=3001` in `.env` and run `docker compose up -d`. Open http://localhost:3001. The internal port remains 3000, including for the health check.

## Troubleshooting

- `docker` is not recognized: install/start Docker Desktop, enable its command-line integration, then reopen your terminal.
- Cannot connect to the daemon: wait for Docker Desktop to finish starting and confirm it is using Linux containers.
- Port already in use: choose another `WEB_PORT` as described above.
- Dependency downloads fail: Docker's build environment needs network access to the image registry and npm; the Compose file does not bypass network policy.
- Supabase connection errors: verify the URL is reachable from the container, the publishable key matches the project, and the migration is applied.
- Build check failures: the container has not started successfully. Read the build output and correct the source/dependency issue rather than skipping checks.

Docker Compose configuration and environment reference: https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/

Next.js self-hosting reference: https://nextjs.org/docs/app/guides/self-hosting
