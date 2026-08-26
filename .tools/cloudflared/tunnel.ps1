# KRACKED DEVS — quick Cloudflare tunnel to the Vite dev server (localhost:3000).
# Prints the public https://*.trycloudflare.com URL. Requires: npm run dev running.
$ErrorActionPreference = 'SilentlyContinue'
$dir = $PSScriptRoot
$exe = Join-Path $dir 'cloudflared.exe'
$cfg = Join-Path $dir 'tunnel-config.yml'
$log = Join-Path $dir 'tunnel.err.log'

Get-Process cloudflared -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*kd-penzine-tabloid*' } | Stop-Process -Force
Start-Sleep -Seconds 1

Start-Process -WindowStyle Hidden -FilePath $exe -ArgumentList @(
  'tunnel', '--url', 'http://localhost:3000',
  '--config', $cfg,
  '--no-autoupdate',
  '--metrics', '127.0.0.1:19399'
) -RedirectStandardError $log -RedirectStandardOutput (Join-Path $dir 'tunnel.log')

Start-Sleep -Seconds 8
$m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -Last 1
if ($m) {
  Write-Host "Tunnel live: $($m.Matches[0].Value)"
} else {
  Write-Host 'Tunnel still starting — check .tools/cloudflared/tunnel.err.log'
}
