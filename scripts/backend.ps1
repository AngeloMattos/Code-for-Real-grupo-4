param([switch]$Test,[switch]$Build)
$taskRoot = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force -Path (Join-Path $taskRoot '.tools') | Out-Null
if ($env:OS -eq 'Windows_NT' -and !$env:JAVA_TOOL_OPTIONS) { $env:JAVA_TOOL_OPTIONS = '-Djdk.net.unixdomain.tmpdir=' + (Join-Path $taskRoot '.tools/tcp-only-unix-indisponivel') }
if (!$env:SPRING_PROFILES_ACTIVE) { $env:SPRING_PROFILES_ACTIVE = 'dev' }
if (!$env:DB_URL -and (Test-Path -LiteralPath (Join-Path $taskRoot '.tools/pgdata/PG_VERSION'))) { $env:DB_URL = 'jdbc:postgresql://127.0.0.1:5433/folhaconecta' }
if ($Test -and (Test-Path -LiteralPath (Join-Path $taskRoot '.tools/postgresql17/pgsql/bin/psql.exe'))) {
  $taskPostgresBin = Join-Path $taskRoot '.tools/postgresql17/pgsql/bin'
  $taskPreviousPassword = $env:PGPASSWORD
  $env:PGPASSWORD = 'folha'
  $taskTestDb = & (Join-Path $taskPostgresBin 'psql.exe') -h 127.0.0.1 -p 5433 -U folha -d postgres -tAc "select 1 from pg_database where datname='folhaconecta_test'"
  if (!$taskTestDb) { & (Join-Path $taskPostgresBin 'createdb.exe') -h 127.0.0.1 -p 5433 -U folha folhaconecta_test }
  if ($taskPreviousPassword) { $env:PGPASSWORD = $taskPreviousPassword } else { Remove-Item Env:PGPASSWORD }
  $env:DB_URL = 'jdbc:postgresql://127.0.0.1:5433/folhaconecta_test'
}
if (!$env:JWT_SECRET) {
  $taskSecret = Join-Path $taskRoot '.tools/dev-jwt-secret.txt'
  if (!(Test-Path -LiteralPath $taskSecret)) { $taskBytes = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($taskBytes); [System.IO.File]::WriteAllText($taskSecret,[Convert]::ToBase64String($taskBytes)) }
  $env:JWT_SECRET = [System.IO.File]::ReadAllText($taskSecret)
}
$taskJava = Get-ChildItem -LiteralPath (Join-Path $taskRoot '.tools') -Directory -Filter 'jdk-17*' | Select-Object -First 1
if ($taskJava) { $env:JAVA_HOME = $taskJava.FullName; $env:PATH = (Join-Path $taskJava.FullName 'bin') + ';' + $env:PATH }
$taskMaven = Join-Path $taskRoot '.tools\apache-maven-3.9.11\bin\mvn.cmd'
if (!(Test-Path -LiteralPath $taskMaven)) { $taskMaven = Join-Path $taskRoot 'backend/mvnw.cmd' }
Push-Location (Join-Path $taskRoot 'backend')
try { if ($Test) { & $taskMaven '-B' '--no-transfer-progress' '-Dmaven.repo.local=../.tools/m2' test } elseif ($Build) { & $taskMaven '-B' '--no-transfer-progress' '-Dmaven.repo.local=../.tools/m2' package } else { & $taskMaven '-B' '--no-transfer-progress' '-Dmaven.repo.local=../.tools/m2' spring-boot:run }; exit $LASTEXITCODE } finally { Pop-Location }
