$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root 'server'
$logDir = Join-Path $env:LOCALAPPDATA 'Temp\opencode'
if (-not (Test-Path -LiteralPath $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

function Test-Port {
  param([int]$Port)
  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-Api {
  param(
    [int]$Port,
    [string]$DatabaseUrl,
    [string]$OutputLog,
    [string]$ErrorLog
  )

  $env:PORT = "$Port"
  if ($null -eq $DatabaseUrl) {
    Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
  }
  else {
    $env:DATABASE_URL = $DatabaseUrl
  }

  Start-Process -FilePath 'npm.cmd' -ArgumentList @('start') `
    -WorkingDirectory $serverDir -WindowStyle Hidden `
    -RedirectStandardOutput $OutputLog -RedirectStandardError $ErrorLog | Out-Null
}

if (-not (Test-Port -Port 4000)) {
  Start-Api -Port 4000 -DatabaseUrl $null `
    -OutputLog (Join-Path $logDir 'comfyhub-api.log') `
    -ErrorLog (Join-Path $logDir 'comfyhub-api.error.log')
}

if (-not (Test-Port -Port 4100)) {
  Start-Api -Port 4100 -DatabaseUrl ' ' `
    -OutputLog (Join-Path $logDir 'comfyhub-4100.log') `
    -ErrorLog (Join-Path $logDir 'comfyhub-4100.error.log')
}

Start-Sleep -Seconds 5

if (-not (Get-Process -Name cloudflared -ErrorAction SilentlyContinue)) {
  $exe = Join-Path $root 'cloudflared.exe'
  if (Test-Path -LiteralPath $exe) {
    $tunOut = Join-Path $logDir 'cloudflared.log'
    $tunErr = Join-Path $logDir 'cloudflared.error.log'
    Start-Process -FilePath $exe -ArgumentList @('tunnel', '--url', 'http://localhost:4000') `
      -WorkingDirectory $root -WindowStyle Hidden `
      -RedirectStandardOutput $tunOut -RedirectStandardError $tunErr | Out-Null

    for ($i = 0; $i -lt 20; $i++) {
      Start-Sleep -Seconds 1
      $match = Get-Content -LiteralPath $tunErr -ErrorAction SilentlyContinue |
        Select-String -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' |
        Select-Object -Last 1
      if ($match) {
        Set-Content -LiteralPath (Join-Path $root 'PUBLIC-LINK.txt') -Value $match.Matches[0].Value
        break
      }
    }
  }
}
