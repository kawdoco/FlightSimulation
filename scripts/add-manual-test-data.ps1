param(
    [ValidateRange(1,1000)][int]$Count = 50,
    [switch]$InternationalOnly,
    [string]$BaseUrl = 'http://localhost:8081',
    [ValidatePattern('^[A-Za-z0-9-]+$')][string]$BatchTag = ('QA-' + [DateTimeOffset]::UtcNow.ToOffset([TimeSpan]::FromHours(5.5)).ToString('yyyyMMdd-HHmmss')),
    [string]$ResultPath = (Join-Path (Split-Path $PSScriptRoot -Parent) 'tmp/manual-test-data-result.json')
)
$ErrorActionPreference = 'Stop'
$target = [Uri]$BaseUrl
if ($target.Scheme -ne 'http' -or $target.Host -notin @('localhost','127.0.0.1') -or $target.Port -ne 8081) {
    throw 'This manual-test importer only targets the local backend on port 8081.'
}
$BaseUrl = $BaseUrl.TrimEnd('/')
Write-Host "Add $Count aircraft and $Count scheduled flights to $BaseUrl. Existing records remain unchanged."
Write-Host "Batch: $BatchTag. Reuse this BatchTag to resume an interrupted import."
$loginName = Read-Host 'Admin/operator username (Enter for admin)'
if ([string]::IsNullOrWhiteSpace($loginName)) { $loginName = 'admin' }
$loginSecret = Read-Host 'Password (hidden)' -AsSecureString
$authHeader = $null
$manifest = [ordered]@{ batchTag=$BatchTag; baseUrl=$BaseUrl; status='running'; aircraft=@(); flights=@() }
function Save-Manifest {
    $resultDirectory = Split-Path $ResultPath -Parent
    [void][IO.Directory]::CreateDirectory($resultDirectory)
    $manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ResultPath -Encoding UTF8
}
function Request-Api([string]$Method,[string]$Path,$Body=$null) {
    $request = @{ Uri="$BaseUrl/api/$Path"; Method=$Method; Headers=@{Authorization=$authHeader}; TimeoutSec=30 }
    if ($null -ne $Body) { $request.ContentType='application/json'; $request.Body=($Body | ConvertTo-Json -Compress) }
    $response = Invoke-RestMethod @request
    return $response
}
try {
    $credential = [PSCredential]::new($loginName,$loginSecret)
    $authHeader = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($loginName+':'+$credential.GetNetworkCredential().Password))
    $account = Request-Api GET 'auth/me'
    if (-not (@($account.roles) | Where-Object { $_ -in @('ROLE_ADMIN','ROLE_OPERATOR') })) {
        throw 'This account is read-only. Sign in with an ADMIN or OPERATOR account.'
    }
    $existingAircraft = @(Request-Api GET 'aircraft')
    $existingFlights = @(Request-Api GET 'flights')
    $models = @(
        @{model='Cessna 172'; manufacturer='Cessna'; fuelCapacity=200; maxSpeed=230; maxAltitude=13000},
        @{model='Boeing 737'; manufacturer='Boeing'; fuelCapacity=26000; maxSpeed=850; maxAltitude=41000},
        @{model='Airbus A320'; manufacturer='Airbus'; fuelCapacity=24000; maxSpeed=840; maxAltitude=39000},
        @{model='Cessna 152'; manufacturer='Cessna'; fuelCapacity=100; maxSpeed=200; maxAltitude=14000},
        @{model='ATR 72'; manufacturer='ATR'; fuelCapacity=5000; maxSpeed=510; maxAltitude=25000}
    )
    $cities = @('Colombo','Kandy','Jaffna','Galle','Chennai','Male','Singapore','Dubai')
    if ($InternationalOnly) {
        $models = @(
            @{model='Airbus A330'; manufacturer='Airbus'; fuelCapacity=139000; maxSpeed=880; maxAltitude=41000},
            @{model='Boeing 777'; manufacturer='Boeing'; fuelCapacity=181000; maxSpeed=905; maxAltitude=43000},
            @{model='Boeing 787'; manufacturer='Boeing'; fuelCapacity=126000; maxSpeed=900; maxAltitude=43000}
        )
    }
    # Synthetic test routes, not airline schedules or aircraft performance specifications.
    $internationalDestinations = @(
        'Chennai (MAA), India','Mumbai (BOM), India','Delhi (DEL), India',
        'Male (MLE), Maldives','Dhaka (DAC), Bangladesh','Kathmandu (KTM), Nepal',
        'Karachi (KHI), Pakistan','Singapore (SIN), Singapore','Kuala Lumpur (KUL), Malaysia',
        'Bangkok (BKK), Thailand','Jakarta (CGK), Indonesia','Manila (MNL), Philippines',
        'Dubai (DXB), United Arab Emirates','Abu Dhabi (AUH), United Arab Emirates',
        'Doha (DOH), Qatar','Muscat (MCT), Oman','Riyadh (RUH), Saudi Arabia',
        'Kuwait City (KWI), Kuwait','Istanbul (IST), Turkey','London (LHR), United Kingdom',
        'Paris (CDG), France','Frankfurt (FRA), Germany','Tokyo (NRT), Japan',
        'Seoul (ICN), South Korea','Melbourne (MEL), Australia'
    )
    $firstDeparture = [DateTimeOffset]::UtcNow.ToOffset([TimeSpan]::FromHours(5.5)).Date.AddDays(1).AddHours(8)
    for ($index=1; $index -le $Count; $index++) {
        $registration = '{0}-A{1:D3}' -f $BatchTag,$index
        $flightNumber = '{0}-F{1:D3}' -f $BatchTag,$index
        $model = $models[($index-1) % $models.Count]
        $plane = $existingAircraft | Where-Object registrationNumber -eq $registration | Select-Object -First 1
        if (-not $plane) {
            $body = @{registrationNumber=$registration; model=$model.model; manufacturer=$model.manufacturer; status='AVAILABLE'; fuelCapacity=$model.fuelCapacity; maxSpeed=$model.maxSpeed; maxAltitude=$model.maxAltitude}
            $plane = Request-Api POST 'aircraft' $body
        } elseif ($plane.model -ne $model.model -or $plane.manufacturer -ne $model.manufacturer) {
            throw "Existing aircraft $registration does not match this batch. Choose a new BatchTag."
        }
        $manifest.aircraft += @{id=$plane.id;registrationNumber=$registration}
        Save-Manifest
        $flight = $existingFlights | Where-Object flightNumber -eq $flightNumber | Select-Object -First 1
        if (-not $flight) {
            $departure = $cities[($index-1)%$cities.Count]
            $destination = $cities[$index%$cities.Count]
            if ($InternationalOnly) {
                $departure = 'Colombo (CMB), Sri Lanka'
                $destination = $internationalDestinations[($index-1)%$internationalDestinations.Count]
            }
            $body = @{flightNumber=$flightNumber; departure=$departure; destination=$destination; scheduledTime=$firstDeparture.AddMinutes(($index-1)*30).ToString('yyyy-MM-ddTHH:mm:ss')}
            $flight = Request-Api POST "flights?aircraftId=$($plane.id)" $body
        } elseif ($flight.aircraft.id -ne $plane.id) {
            throw "Existing flight $flightNumber belongs to another aircraft. Choose a new BatchTag."
        }
        $manifest.flights += @{id=$flight.id;flightNumber=$flightNumber;aircraftId=$plane.id;departure=$flight.departure;destination=$flight.destination}
        Save-Manifest
        Write-Host ("Added/verified {0}/{1}: {2} -> {3}" -f $index,$Count,$registration,$flightNumber)
    }
    $verifiedAircraft = @((Request-Api GET 'aircraft') | Where-Object { $_.registrationNumber -like "$BatchTag-A*" })
    $verifiedFlights = @((Request-Api GET 'flights') | Where-Object { $_.flightNumber -like "$BatchTag-F*" })
    if ($verifiedAircraft.Count -ne $Count -or $verifiedFlights.Count -ne $Count) { throw 'Final record counts do not match the requested batch size.' }
    foreach ($item in $manifest.flights) {
        $saved = $verifiedFlights | Where-Object id -eq $item.id | Select-Object -First 1
        if ($saved.aircraft.id -ne $item.aircraftId) { throw 'Final aircraft/flight relationship verification failed.' }
        if ($InternationalOnly -and ($saved.departure -ne 'Colombo (CMB), Sri Lanka' -or $saved.destination -notin $internationalDestinations)) {
            throw 'International route verification failed.'
        }
    }
    $manifest.status = 'complete'
    Save-Manifest
    Write-Host "SUCCESS: verified $Count aircraft and $Count linked flights. Refresh the app."
    Write-Host "Record IDs: $ResultPath"
} catch {
    $manifest.status='failed'
    $manifest.error=$_.Exception.Message
    Save-Manifest
    Write-Host "Import stopped. Already-added records are retained. Resume with -BatchTag $BatchTag."
    throw
} finally {
    $authHeader=$null
    $credential=$null
    $loginSecret.Dispose()
}
