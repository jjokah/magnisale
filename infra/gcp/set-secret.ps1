#!/usr/bin/env pwsh
<#
Sets one value in the platform's environment, held in Secret Manager. The value
is typed at a hidden prompt, and the next deploy picks it up.

  pwsh infra/gcp/set-secret.ps1 CLOUDFLARE_TUNNEL_TOKEN
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory, Position = 0)]
  [ValidatePattern("^[A-Z][A-Z0-9_]*$")]
  [string]$Key,
  [string]$Project = "magnisale"
)

$ErrorActionPreference = "Stop"
$SecretName = "magnisale-platform-env"
$gcloudBin = (Get-Command gcloud.cmd -ErrorAction SilentlyContinue)?.Source ?? "gcloud"

# These are baked into the database or every session. Changing them here alone
# would lock the app out of its data.
if ($Key -in "POSTGRES_PASSWORD", "APP_DB_PASSWORD", "BETTER_AUTH_SECRET") {
  throw "$Key needs a planned rotation. See infra/README.md."
}

$value = Read-Host -Prompt $Key -MaskInput
if (-not $value) { throw "No value entered. Nothing changed." }
if ($value.Contains("'") -or $value -match "[\r\n]") { throw "The value cannot contain a single quote or a line break." }

$current = & $gcloudBin --project $Project secrets versions access latest --secret $SecretName
if ($LASTEXITCODE -ne 0) { throw "Cannot read the secret. Run infra/gcp/setup.ps1 first." }

$file = Join-Path ([System.IO.Path]::GetTempPath()) "magnisale-env-$([guid]::NewGuid())"
try {
  $lines = @($current | ForEach-Object { $_.TrimEnd("`r") } | Where-Object { $_ -and -not $_.StartsWith("$Key=") }) + "$Key='$value'"
  # Unix line endings: the VM reads this file, and a stray \r would end up in every value.
  [System.IO.File]::WriteAllText($file, ($lines -join "`n") + "`n")
  & $gcloudBin --project $Project --quiet secrets versions add $SecretName --data-file $file
  if ($LASTEXITCODE -ne 0) { throw "Could not save the new value." }
}
finally {
  Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
}
Write-Host "$Key saved. It applies on the next deploy."
