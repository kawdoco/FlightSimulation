param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference='Stop'
# Run from deploy with Docker Compose environment already configured.
$target=[System.IO.Path]::GetFullPath($Destination)
if(Test-Path -LiteralPath $target){throw 'Backup destination already exists. Choose a new filename.'}
& docker compose -f "$PSScriptRoot/compose.yaml" exec -T database pg_dump -U flightsimulation -d flightsimulation -Fc -f /tmp/flight-backup.dump
if($LASTEXITCODE -ne 0){throw 'Database dump failed.'}
& docker compose -f "$PSScriptRoot/compose.yaml" cp database:/tmp/flight-backup.dump $target
if($LASTEXITCODE -ne 0){throw 'Backup copy failed.'}
Write-Host "Backup created: $target"
