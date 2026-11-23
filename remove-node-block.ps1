$ErrorActionPreference = 'Stop'

Get-NetFirewallRule -DisplayName 'Node.js JavaScript Runtime' -ErrorAction SilentlyContinue |
  Remove-NetFirewallRule

Write-Host 'Removed Node.js JavaScript Runtime firewall block rules.'
