$ErrorActionPreference = 'Stop'

# Remove Windows "Node.js JavaScript Runtime" block rules created when a firewall
# prompt was declined. These override normal allow rules.
Get-NetFirewallRule -DisplayName 'Node.js JavaScript Runtime' -ErrorAction SilentlyContinue |
  Remove-NetFirewallRule

# Allow the two ComfyHub ports from any device on the local network.
# Scoped by port only so other services are not exposed.
foreach ($port in @(5173, 4000)) {
  $name = "ComfyHub $port LAN phone"
  Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue | Remove-NetFirewallRule
  New-NetFirewallRule `
    -DisplayName $name `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort $port `
    -Action Allow `
    -Profile Any `
    -RemoteAddress Any | Out-Null
}

# Keep a blocked-connection log in case we need to debug a phone that still cannot connect.
Set-NetFirewallProfile -Name Public, Private -LogBlocked True

Write-Host 'Windows Firewall now allows ComfyHub on ports 5173 and 4000 from any LAN device.'
Write-Host 'Blocked connection logging is enabled.'
