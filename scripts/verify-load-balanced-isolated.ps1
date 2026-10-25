param([Parameter(Mandatory=$true)][string]$Caddy)
# Disposable H2 only. Does not use DB_URL/DB_PASSWORD, hardware, or ports 8081/8082.
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$ErrorActionPreference='Continue'
$javaHomeLine=(& java -XshowSettings:properties -version 2>&1 | Select-String '^\s*java.home = ').ToString()
$ErrorActionPreference='Stop'
$javaExecutable=Join-Path ($javaHomeLine -replace '^\s*java.home = ','') 'bin/java.exe'
foreach($port in 18081,18082,18090){if(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue){throw "Test port $port is occupied; no processes stopped."}}
$work=Join-Path ([IO.Path]::GetTempPath()) ('flightsim-lb-'+[guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $work | Out-Null
$saved=@{};foreach($key in @('APP_ADMIN_PASSWORD','LB_TEST_PASSWORD','LB_GATEWAY_PORT','LB_BACKEND_A','LB_BACKEND_B','LB_FRONTEND_ROOT','VITE_BACKEND_URL')){$saved[$key]=[Environment]::GetEnvironmentVariable($key)}
$a=$null;$b=$null;$gateway=$null
function Wait-TestBackend([int]$port){
 for($i=0;$i -lt 60;$i++){
  try {if((Invoke-WebRequest "http://127.0.0.1:$port/internal/available" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 204){return}}catch{}
  Start-Sleep -Seconds 1
 };throw "Test backend $port did not become ready. Logs: $work"
}
function Start-TestBackend([string]$id,[int]$port){
 $jar=(Join-Path $root 'backend/target/backend-0.0.1-SNAPSHOT.jar')
 $db=(Join-Path $work 'database').Replace('\','/')
 $arguments=@('-jar',('"'+$jar+'"'),'--spring.profiles.active=local',"--server.port=$port",'--server.address=127.0.0.1',"--app.instance-id=$id",'--app.frontend.url=http://localhost:18090','--flightsimulation.serial.enabled=false',"--spring.datasource.url=jdbc:h2:file:$db;AUTO_SERVER=TRUE",'--spring.datasource.username=sa','--spring.datasource.password=','--spring.datasource.driver-class-name=org.h2.Driver','--spring.jpa.hibernate.ddl-auto=update','--spring.flyway.enabled=false','--spring.jpa.show-sql=false','--logging.level.root=WARN','--spring.datasource.hikari.maximum-pool-size=2')
 Start-Process $javaExecutable -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $work "$id.log") -RedirectStandardError (Join-Path $work "$id.err")
}
Push-Location $root
try {
 $env:VITE_BACKEND_URL='http://localhost:18090'
 npm --prefix frontend run build
 if($LASTEXITCODE -ne 0){throw 'Gateway frontend build failed.'}
 $env:APP_ADMIN_PASSWORD='TestOnly-'+[guid]::NewGuid().ToString('N');$env:LB_TEST_PASSWORD=$env:APP_ADMIN_PASSWORD
 $env:LB_GATEWAY_PORT='18090';$env:LB_BACKEND_A='127.0.0.1:18081';$env:LB_BACKEND_B='127.0.0.1:18082';$env:LB_FRONTEND_ROOT=(Join-Path $root 'frontend/dist').Replace('\','/')
 $a=Start-TestBackend 'backend-a' 18081;Wait-TestBackend 18081
 $b=Start-TestBackend 'backend-b' 18082;Wait-TestBackend 18082
 $config=Join-Path $root 'deploy/Caddyfile.load-balanced'
 $gateway=Start-Process $Caddy -ArgumentList @('run','--config',('"'+$config+'"'),'--adapter','caddyfile') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $work 'gateway.log') -RedirectStandardError (Join-Path $work 'gateway.err')
 Start-Sleep -Seconds 3
 $credential=New-Object System.Management.Automation.PSCredential('admin',(ConvertTo-SecureString $env:LB_TEST_PASSWORD -AsPlainText -Force))
 & (Join-Path $PSScriptRoot 'test-load-balanced.ps1') -Gateway 'http://localhost:18090' -Requests 4 -Concurrency 2 -Credential $credential
 $credential=$null
 & node scripts/lb-integration.mjs baseline
 if($LASTEXITCODE -ne 0){throw 'Baseline integration failed.'}
 Write-Host 'Controlled failure: stopping ONLY the disposable backend B created by this script.'
 Stop-Process -Id $b.Id; $b.WaitForExit();$b=$null;Start-Sleep -Seconds 5
 & node scripts/lb-integration.mjs failover
 if($LASTEXITCODE -ne 0){throw 'Failure-detection verification failed.'}
 $b=Start-TestBackend 'backend-b' 18082;Wait-TestBackend 18082;Start-Sleep -Seconds 5
 & node scripts/lb-integration.mjs rejoin
 if($LASTEXITCODE -ne 0){throw 'Rejoin verification failed.'}
 Write-Host "PASS. Disposable logs/database retained at $work"
} finally {
 foreach($process in @($gateway,$b,$a)){if($process -and !$process.HasExited){Stop-Process -Id $process.Id -ErrorAction SilentlyContinue;$process.WaitForExit()}}
 foreach($key in $saved.Keys){[Environment]::SetEnvironmentVariable($key,$saved[$key])}
 Pop-Location
}
