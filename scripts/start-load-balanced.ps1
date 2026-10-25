param(
 [Parameter(Mandatory=$true)][ValidateSet('A','B','Gateway')][string]$Component,
 [ValidatePattern('^(AUTO|COM[0-9]+)$')][string]$SerialPort='AUTO',
 [ValidateRange(1,2147483647)][long]$FlightId=1,
 [ValidateRange(1024,65535)][int]$GatewayPort=8090,
 [string]$Caddy='caddy'
)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$origin="http://localhost:$GatewayPort"
function Wait-Owner {
 $deadline=(Get-Date).AddSeconds(120)
 do {
  try { $r=Invoke-WebRequest 'http://127.0.0.1:8081/internal/available' -UseBasicParsing -TimeoutSec 3; if($r.StatusCode -eq 204 -and $r.Headers['X-Backend-Instance'] -eq 'backend-a'){return} } catch {}
  Start-Sleep -Seconds 2
 } while((Get-Date) -lt $deadline)
 throw 'Backend A is not ready. Start A first and check its terminal.'
}
$port=if($Component -eq 'A'){8081}elseif($Component -eq 'B'){8082}else{$GatewayPort}
if(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue){throw "Port $port is occupied. No processes were stopped. Use Ctrl+C in the owning terminal."}
Push-Location $root
try {
 if($Component -eq 'Gateway'){
  Wait-Owner
  if(!(Get-Command $Caddy -ErrorAction SilentlyContinue)){throw 'Install Caddy or pass -Caddy with the caddy.exe path.'}
  $oldVite=$env:VITE_BACKEND_URL; $oldGateway=$env:LB_GATEWAY_PORT; $oldRoot=$env:LB_FRONTEND_ROOT
  try {
   $env:VITE_BACKEND_URL=$origin
   npm --prefix frontend run build
   if($LASTEXITCODE -ne 0){throw 'Frontend build failed.'}
   $env:LB_GATEWAY_PORT="$GatewayPort"; $env:LB_FRONTEND_ROOT=(Join-Path $root 'frontend/dist').Replace('\','/')
   & $Caddy validate --config deploy/Caddyfile.load-balanced --adapter caddyfile
   if($LASTEXITCODE -ne 0){throw 'Caddy validation failed.'}
   & $Caddy run --config deploy/Caddyfile.load-balanced --adapter caddyfile
  } finally {$env:VITE_BACKEND_URL=$oldVite;$env:LB_GATEWAY_PORT=$oldGateway;$env:LB_FRONTEND_ROOT=$oldRoot}
 } else {
  foreach($key in @('DB_URL','DB_USERNAME','DB_PASSWORD')){if(![Environment]::GetEnvironmentVariable($key)){throw "Set $key in this terminal without putting credentials in command history."}}
  if($env:DB_URL -notmatch '^jdbc:postgresql:'){throw 'This demo requires the configured Supabase PostgreSQL connection.'}
  if($Component -eq 'A'){
   & backend/mvnw.cmd -f backend/pom.xml -DskipTests package
   if($LASTEXITCODE -ne 0){throw 'Backend build failed.'}
  } else {Wait-Owner}
  $jar=Join-Path $root 'backend/target/backend-0.0.1-SNAPSHOT.jar'
  if(!(Test-Path $jar)){throw 'Start A first to build the backend.'}
  $serial=if($Component -eq 'A'){'true'}else{'false'}
  $migrate=if($Component -eq 'A'){'true'}else{'false'}
  Push-Location backend
  try {
   & java -jar $jar '--spring.profiles.active=supabase' "--server.port=$port" '--server.address=127.0.0.1' "--app.instance-id=backend-$($Component.ToLower())" "--app.frontend.url=$origin" "--flightsimulation.serial.enabled=$serial" "--flightsimulation.serial.port=$SerialPort" "--flightsimulation.serial.flight-id=$FlightId" '--spring.datasource.hikari.maximum-pool-size=2' '--spring.datasource.hikari.minimum-idle=1' '--spring.datasource.hikari.connection-timeout=3000' "--spring.flyway.enabled=$migrate"
   if($LASTEXITCODE -ne 0){throw 'Backend stopped with an error. Check the first startup error.'}
  } finally {Pop-Location}
 }
} finally {Pop-Location}
