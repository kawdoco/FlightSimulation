param(
 [string]$DatabaseUrl='jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
 [string]$DatabaseUsername='postgres.ijipyfaegjgtzwqratrb',
 [switch]$Apply
)
$ErrorActionPreference='Stop'
if(Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue){throw 'Stop the backend with Ctrl+C first. H2 must be offline for backup/import.'}
if($DatabaseUrl -notmatch '^jdbc:postgresql://[^\s]+:5432/' -or $DatabaseUrl -notmatch '[?&]sslmode=(require|verify-full)(&|$)'){throw 'TLS session-pooler JDBC URL on port 5432 required.'}
$root=Split-Path $PSScriptRoot -Parent
$source=Join-Path $root 'backend/data/flightsimulation.mv.db'
if(-not(Test-Path -LiteralPath $source)){throw 'Source H2 database not found.'}
$secret=Read-Host 'Supabase database password (hidden)' -AsSecureString
if($secret.Length -eq 0){$secret.Dispose();throw 'Password required.'}
$names=@('DB_URL','DB_USERNAME','DB_PASSWORD','MIGRATION_H2_URL');$prior=@{}
foreach($name in $names){$prior[$name]=[Environment]::GetEnvironmentVariable($name,'Process')}
Push-Location (Join-Path $root 'backend')
try{
 & .\mvnw.cmd -q -DskipTests compile dependency:build-classpath '-DincludeScope=runtime' '-Dmdep.outputFile=target/migration-classpath.txt'
 if($LASTEXITCODE -ne 0){throw 'Migration tool compilation failed.'}
 $backupFolder=Join-Path $root ('backups/h2-'+[DateTime]::UtcNow.ToString('yyyyMMddHHmmss'))
 New-Item -ItemType Directory -Path $backupFolder -ErrorAction Stop | Out-Null
 $backup=Join-Path $backupFolder 'flightsimulation.mv.db'
 Copy-Item -LiteralPath $source -Destination $backup
 if((Get-FileHash -LiteralPath $source).Hash -ne (Get-FileHash -LiteralPath $backup).Hash){throw 'Backup hash mismatch.'}
 $env:MIGRATION_H2_URL='jdbc:h2:file:'+($source.Substring(0,$source.Length-6).Replace('\','/'))+';IFEXISTS=TRUE;ACCESS_MODE_DATA=r'
 $env:DB_URL=$DatabaseUrl;$env:DB_USERNAME=$DatabaseUsername;$env:DB_PASSWORD=[Net.NetworkCredential]::new('',$secret).Password
 $classpath=(Join-Path (Get-Location) 'target/classes')+';'+(Get-Content -Raw target/migration-classpath.txt).Trim()
 Write-Host "Verified backup: $backup"
 if($Apply){& java -cp $classpath com.flightsimulation.migration.H2ToSupabase --apply}
 else{& java -cp $classpath com.flightsimulation.migration.H2ToSupabase}
 if($LASTEXITCODE -ne 0){throw 'Migration failed. Copy the Migration diagnostic / SQLSTATE line above. Source backup is retained; do not start Supabase yet.'}
}finally{
 foreach($name in $names){[Environment]::SetEnvironmentVariable($name,$prior[$name],'Process')};$secret.Dispose();Pop-Location
}

