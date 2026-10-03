param([switch]$Stop)
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskBin = Join-Path $taskRoot '.tools/postgresql17/pgsql/bin'
$taskData = Join-Path $taskRoot '.tools/pgdata'
if ($Stop) { & (Join-Path $taskBin 'pg_ctl.exe') -D $taskData -m fast stop; exit $LASTEXITCODE }
if (!(Test-Path -LiteralPath (Join-Path $taskData 'PG_VERSION'))) {
  $taskPassword = Join-Path $taskRoot '.tools/pg-password.txt'
  [System.IO.File]::WriteAllText($taskPassword,'folha')
  & (Join-Path $taskBin 'initdb.exe') -D $taskData -U folha --pwfile=$taskPassword --auth=scram-sha-256 --encoding=UTF8 --locale=C
  Remove-Item -LiteralPath $taskPassword
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& (Join-Path $taskBin 'pg_ctl.exe') -D $taskData status
if ($LASTEXITCODE -ne 0) { & (Join-Path $taskBin 'pg_ctl.exe') -D $taskData -l (Join-Path $taskRoot '.tools/postgres.log') -o '-h 127.0.0.1 -p 5433' start }
$env:PGPASSWORD = 'folha'
$taskExists = & (Join-Path $taskBin 'psql.exe') -h 127.0.0.1 -p 5433 -U folha -d postgres -tAc "select 1 from pg_database where datname='folhaconecta'"
if (!$taskExists) { & (Join-Path $taskBin 'createdb.exe') -h 127.0.0.1 -p 5433 -U folha folhaconecta }
Remove-Item Env:PGPASSWORD
