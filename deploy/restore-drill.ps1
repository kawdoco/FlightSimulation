param([Parameter(Mandatory=$true)][string]$BackupFile)
$ErrorActionPreference='Stop'
$backup=(Resolve-Path -LiteralPath $BackupFile).Path
$drillDatabase='restore_drill_'+[DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
# A new database is created; existing databases are never overwritten or removed.
& docker compose -f "$PSScriptRoot/compose.yaml" cp $backup database:/tmp/restore-drill.dump
if($LASTEXITCODE -ne 0){throw 'Unable to copy backup.'}
& docker compose -f "$PSScriptRoot/compose.yaml" exec -T database createdb -U flightsimulation $drillDatabase
if($LASTEXITCODE -ne 0){throw 'Unable to create isolated restore database.'}
& docker compose -f "$PSScriptRoot/compose.yaml" exec -T database pg_restore -U flightsimulation -d $drillDatabase --exit-on-error /tmp/restore-drill.dump
if($LASTEXITCODE -ne 0){throw "Restore failed; inspect isolated database $drillDatabase"}
& docker compose -f "$PSScriptRoot/compose.yaml" exec -T database psql -U flightsimulation -d $drillDatabase -v ON_ERROR_STOP=1 -c 'SELECT count(*) AS aircraft FROM aircraft; SELECT count(*) AS flights FROM flights; SELECT count(*) AS telemetry FROM telemetry;'
if($LASTEXITCODE -ne 0){throw 'Restored table checks failed.'}
Write-Host "Restore completed into $drillDatabase. Review counts and perform application smoke checks before declaring recovery verified. Database retained for inspection."
