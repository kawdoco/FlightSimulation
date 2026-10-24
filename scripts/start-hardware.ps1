param([string]$Port='COM3',[long]$FlightId=1)
$ErrorActionPreference='Stop'
if($FlightId -lt 1){throw 'FlightId must be positive.'}
if($Port -notmatch '^COM[0-9]+$'){throw 'Supply a Windows COM port such as COM3.'}
if(Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue){throw 'Backend already running on 8081. Stop it with Ctrl+C in its terminal before starting hardware mode.'}
Push-Location (Join-Path (Split-Path $PSScriptRoot -Parent) 'backend')
try {
 & .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--flightsimulation.serial.enabled=true --flightsimulation.serial.port=$Port --flightsimulation.serial.flight-id=$FlightId"
 if($LASTEXITCODE -ne 0){throw 'Hardware backend startup failed. Check the first error above.'}
} finally {Pop-Location}
