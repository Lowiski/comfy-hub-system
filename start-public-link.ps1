$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot

& (Join-Path $root 'ensure-comfyhub.ps1')

Start-Sleep -Seconds 6

$linkFile = Join-Path $root 'PUBLIC-LINK.txt'
$url = if (Test-Path -LiteralPath $linkFile) {
  (Get-Content -LiteralPath $linkFile -Raw).Trim()
}
else {
  ''
}

if (-not $url) {
  Write-Warning 'The public link was not ready yet. Check cloudflared.error.log in the temp folder.'
  exit 1
}

Write-Host ''
Write-Host 'ComfyHub public link (works from any network):'
Write-Host $url
Write-Host ''
Write-Host 'The link changes if the tunnel is restarted.'
