param(
    [string]$DatabaseUrl = 'jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    [string]$DatabaseUsername = 'postgres.ijipyfaegjgtzwqratrb'
)

$ErrorActionPreference = 'Stop'
Get-Command mvn -ErrorAction Stop | Out-Null

# AsSecureString also works in Windows PowerShell 5.1.
$databaseSecret = Read-Host 'Enter your Supabase DATABASE password' -AsSecureString
if ($databaseSecret.Length -eq 0) {
    $databaseSecret.Dispose()
    throw 'The database password cannot be empty.'
}

$previousUrl = $env:DB_URL
$previousUsername = $env:DB_USERNAME
$previousPassword = $env:DB_PASSWORD

Push-Location $PSScriptRoot
try {
    $env:DB_URL = $DatabaseUrl
    $env:DB_USERNAME = $DatabaseUsername
    $env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', $databaseSecret).Password

    # Explicitly select the Supabase configuration instead of the local H2 profile.
    & mvn spring-boot:run '-Dspring-boot.run.profiles=supabase'
    $runExitCode = $LASTEXITCODE
}
finally {
    $env:DB_URL = $previousUrl
    $env:DB_USERNAME = $previousUsername
    $env:DB_PASSWORD = $previousPassword
    $previousPassword = $null
    $databaseSecret.Dispose()
    Pop-Location
}

if ($runExitCode -ne 0) {
    throw 'Backend startup failed. Check the first ERROR or Caused by line above. For password authentication failures, verify or reset the Supabase database password.'
}
