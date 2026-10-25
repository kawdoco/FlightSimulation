param(
 [string]$Gateway='http://localhost:8090',
 [ValidateRange(2,100)][int]$Requests=10,
 [ValidateRange(1,8)][int]$Concurrency=4,
 [System.Management.Automation.PSCredential]$Credential
)
$ErrorActionPreference='Stop'
if(!$Credential){$Credential=Get-Credential -Message 'Existing FlightSimulation read-only credentials'}
Add-Type -AssemblyName System.Net.Http
$client=New-Object System.Net.Http.HttpClient
$client.Timeout=[TimeSpan]::FromSeconds(15)
$plain=$Credential.GetNetworkCredential().Password
$token=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Credential.UserName+':'+$plain))
$plain=$null
$client.DefaultRequestHeaders.Authorization=New-Object System.Net.Http.Headers.AuthenticationHeaderValue('Basic',$token)
$token=$null
$results=@()
function Complete-Read($task,$watch,$phase){
 try {
  $response=$task.GetAwaiter().GetResult();$watch.Stop()
  try {
   $instance=if($response.Headers.Contains('X-Backend-Instance')){($response.Headers.GetValues('X-Backend-Instance') -join ',')}else{'missing'}
   [pscustomobject]@{Phase=$phase;Instance=$instance;Status=[int]$response.StatusCode;Milliseconds=[math]::Round($watch.Elapsed.TotalMilliseconds,1);Error=if($response.IsSuccessStatusCode){''}else{'HTTP failure'}}
  } finally {$response.Dispose()}
 } catch {$watch.Stop();[pscustomobject]@{Phase=$phase;Instance='unavailable';Status=0;Milliseconds=[math]::Round($watch.Elapsed.TotalMilliseconds,1);Error='Request failed'}}
}
try {
 for($i=0;$i -lt $Requests;$i++){
  $watch=[Diagnostics.Stopwatch]::StartNew();$results+=Complete-Read ($client.GetAsync("$Gateway/api/aircraft")) $watch 'Sequential'
 }
 for($i=0;$i -lt $Requests;$i+=$Concurrency){
  $pending=@();for($j=0;$j -lt [Math]::Min($Concurrency,$Requests-$i);$j++){$pending+=@{Watch=[Diagnostics.Stopwatch]::StartNew();Task=$client.GetAsync("$Gateway/api/aircraft")}}
  foreach($item in $pending){$results+=Complete-Read $item.Task $item.Watch 'Concurrent'}
 }
 $results | Format-Table -AutoSize
 $results | Group-Object Phase,Instance | Select-Object Name,Count | Format-Table -AutoSize
 $results | Group-Object Phase | ForEach-Object {
  $times=@($_.Group.Milliseconds | Sort-Object)
  [pscustomobject]@{Phase=$_.Name;MeanMs=[math]::Round(($_.Group | Measure-Object Milliseconds -Average).Average,1);P95Ms=$times[[math]::Ceiling(.95*$times.Count)-1];Errors=@($_.Group | Where-Object Error).Count}
 } | Format-Table -AutoSize
 if(@($results | Where-Object Error).Count){throw 'Verification had errors; inspect status counts above.'}
} finally {$client.Dispose();$Credential=$null}
