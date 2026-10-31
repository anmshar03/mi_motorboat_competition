# Local policy harness using an isolated PostgreSQL cluster. Requires PostgreSQL
# binaries in PATH, or -PostgresBin. Does not connect to an existing database.
param([string]$PostgresBin = 'C:/Program Files/PostgreSQL/14/bin')
$ErrorActionPreference = 'Stop'
$dataDir = Join-Path (Get-Location) '.cache/postgres/data'
$logPath = Join-Path (Get-Location) '.cache/postgres/server.log'
$psql = Join-Path $PostgresBin 'psql.exe'
$pgctl = Join-Path $PostgresBin 'pg_ctl.exe'
if (-not (Test-Path -LiteralPath (Join-Path $dataDir 'PG_VERSION'))) {
  & (Join-Path $PostgresBin 'initdb.exe') -D $dataDir -U postgres -A trust --no-locale --encoding=UTF8
  if ($LASTEXITCODE -ne 0) { throw 'Could not initialize isolated test cluster.' }
}
& $pgctl -D $dataDir -l $logPath -o '-h 127.0.0.1 -p 55439' -w start
if ($LASTEXITCODE -ne 0) {
  # pg_ctl's Windows restricted-token launcher is unsupported in some managed
  # shells. Start the same local postgres process under this shell's identity.
  $server = Start-Process -FilePath (Join-Path $PostgresBin 'postgres.exe') -ArgumentList @('-D', ('"' + $dataDir + '"'), '-h', '127.0.0.1', '-p', '55439') -WindowStyle Hidden -PassThru -RedirectStandardOutput $logPath -RedirectStandardError ($logPath + '.error')
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if ($server.HasExited) { break }
    & (Join-Path $PostgresBin 'pg_isready.exe') -h 127.0.0.1 -p 55439 -q
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Milliseconds 250
  }
  if (-not $ready) {
    if (-not $server.HasExited) { Stop-Process -Id $server.Id }
    throw 'Could not start isolated test cluster. See .cache/postgres/server.log.error.'
  }
}
try {
  # Verify the server identity before any database/role reset. A port collision
  # must never make this harness mutate an unrelated PostgreSQL service.
  $reportedDir = & $psql -h 127.0.0.1 -p 55439 -U postgres -d postgres -At -v ON_ERROR_STOP=1 -c "select current_setting('data_directory')"
  if ($LASTEXITCODE -ne 0) { throw 'Could not verify the isolated server identity.' }
  $expectedDir = [IO.Path]::GetFullPath($dataDir).TrimEnd([char[]]'\/')
  $actualDir = [IO.Path]::GetFullPath(([string]$reportedDir).Trim()).TrimEnd([char[]]'\/')
  if (-not [String]::Equals($expectedDir, $actualDir, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Port 55439 belongs to a different cluster. Refusing to reset databases or roles.'
  }
  # Minimal Supabase identity compatibility shim. This verifies PostgreSQL grants,
  # triggers, transactions and RLS, but does not emulate Supabase Auth or PostgREST.
  $bootstrap = @'
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
'@
  & $psql -h 127.0.0.1 -p 55439 -U postgres -d postgres -v ON_ERROR_STOP=1 -c 'drop database if exists boat_platform_test'
  if ($LASTEXITCODE -ne 0) { throw 'Could not reset isolated test database.' }
  & $psql -h 127.0.0.1 -p 55439 -U postgres -d postgres -v ON_ERROR_STOP=1 -c 'create database boat_platform_test'
  if ($LASTEXITCODE -ne 0) { throw 'Could not create isolated test database.' }
  # Roles are cluster-wide, so recreate cleanly when repeating the harness.
  & $psql -h 127.0.0.1 -p 55439 -U postgres -d postgres -v ON_ERROR_STOP=1 -c 'drop role if exists anon, authenticated'
  if ($LASTEXITCODE -ne 0) { throw 'Could not reset local test roles.' }
  $bootstrap | & $psql -h 127.0.0.1 -p 55439 -U postgres -d boat_platform_test -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) { throw 'Identity harness failed.' }
  & $psql -h 127.0.0.1 -p 55439 -U postgres -d boat_platform_test -v ON_ERROR_STOP=1 -f supabase/migrations/202610310001_foundation.sql
  if ($LASTEXITCODE -ne 0) { throw 'Migration failed.' }
  & $psql -h 127.0.0.1 -p 55439 -U postgres -d boat_platform_test -v ON_ERROR_STOP=1 -f supabase/tests/foundation.sql
  if ($LASTEXITCODE -ne 0) { throw 'RLS tests failed.' }
  Write-Output 'Foundation migration and PostgreSQL policy tests passed.'
} finally {
  & $pgctl -D $dataDir -m fast -w stop
}
