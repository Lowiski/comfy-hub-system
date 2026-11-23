Set-NetFirewallProfile -Name Public, Private -LogAllowed True -LogBlocked True
Write-Host 'Windows Firewall allowed + blocked connection logging enabled.'
