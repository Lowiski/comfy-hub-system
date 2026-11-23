$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$check = Join-Path $root 'ensure-comfyhub.ps1'

while ($true) {
  & $check
  Start-Sleep -Seconds 10
}
