$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $root 'server'
$webDir = Join-Path $root 'front-end'

function Install-IfNeeded {
  param([string]$Directory)

  if (-not (Test-Path (Join-Path $Directory 'node_modules'))) {
    Write-Host "Installing dependencies in $Directory ..."
    & npm.cmd install --prefix $Directory
  }
}

Install-IfNeeded -Directory $apiDir
Install-IfNeeded -Directory $webDir

Write-Host 'Starting ComfyHub API ...'
Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev') -WorkingDirectory $apiDir -WindowTitle 'ComfyHub API'

Write-Host 'Starting ComfyHub web app ...'
Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev') -WorkingDirectory $webDir -WindowTitle 'ComfyHub Web'

$lanIp = 'localhost'
try {
  $found = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
    Select-Object -First 1
  if ($found) { $lanIp = $found.IPAddress }
} catch {
  # Get-NetIPAddress is unavailable on some systems; localhost still works locally.
}

Write-Host ''
Write-Host 'ComfyHub is starting.'
Write-Host "On this device:  http://localhost:5173"
Write-Host "On same Wi-Fi:   http://$($lanIp):5173"
Write-Host 'Built app only:  http://localhost:4000 (after npm run build in front-end)'
Write-Host ''
Write-Host 'Keep both terminal windows open while testing.'
