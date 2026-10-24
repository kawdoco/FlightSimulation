param(
    [string]$DatabaseUrl=$env:DB_URL,
    [string]$DatabaseUsername=$env:DB_USERNAME,
    [switch]$Hardware,
    [string]$Port='COM3',
    [long]$FlightId=1
)
$ErrorActionPreference='Stop'
if([string]::IsNullOrWhiteSpace($DatabaseUrl)){$DatabaseUrl='jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'}
if($DatabaseUrl -notmatch '^jdbc:postgresql://[^\s]+:5432/' -or $DatabaseUrl -notmatch '[?&]sslmode=(require|verify-full)(&|$)'){throw 'Use the PostgreSQL JDBC session pooler URL on port 5432 with sslmode=require or verify-full.'}
if([string]::IsNullOrWhiteSpace($DatabaseUsername)){$DatabaseUsername='postgres.ijipyfaegjgtzwqratrb'}
if([string]::IsNullOrWhiteSpace($DatabaseUsername)){throw 'Database username is required.'}
if($Port -notmatch '^COM[0-9]+$' -or $FlightId -lt 1){throw 'Invalid hardware port/flight ID.'}
if(Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue){throw 'Stop the existing backend on port 8081 before changing databases.'}
$databaseSecret=Read-Host 'Supabase DATABASE password (hidden)' -AsSecureString
if($databaseSecret.Length -eq 0){$databaseSecret.Dispose();throw 'Database password is required.'}
$adminSecret=$null
if(-not $env:APP_ADMIN_PASSWORD){$adminSecret=Read-Host 'Initial admin password (only needed if admin is missing)' -AsSecureString}
$names=@('DB_URL','DB_USERNAME','DB_PASSWORD','APP_ADMIN_PASSWORD','APP_PROFILE')
$previous=@{};foreach($name in $names){$previous[$name]=[Environment]::GetEnvironmentVariable($name,'Process')}
Push-Location $PSScriptRoot
try{
 $env:DB_URL=$DatabaseUrl;$env:DB_USERNAME=$DatabaseUsername
 $env:DB_PASSWORD=[Net.NetworkCredential]::new('',$databaseSecret).Password
 if($adminSecret){$env:APP_ADMIN_PASSWORD=[Net.NetworkCredential]::new('',$adminSecret).Password}
 $env:APP_PROFILE='supabase'
 $arguments="--spring.profiles.active=supabase --flightsimulation.serial.enabled=$($Hardware.IsPresent.ToString().ToLowerInvariant()) --flightsimulation.serial.port=$Port --flightsimulation.serial.flight-id=$FlightId"
 & .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=$arguments"
 if($LASTEXITCODE -ne 0){throw 'Supabase startup failed; inspect the first Caused by message. Do not enable automatic Flyway baseline or delete data.'}
}finally{
 foreach($name in $names){[Environment]::SetEnvironmentVariable($name,$previous[$name],'Process')}
 $databaseSecret.Dispose();if($adminSecret){$adminSecret.Dispose()};Pop-Location
}
