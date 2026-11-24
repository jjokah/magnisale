#!/usr/bin/env pwsh
<#
Creates the Google Cloud side of the platform: network, VM, image registry,
secrets, daily disk snapshots and keyless deploys from GitHub Actions.

Safe to run again: anything that already exists is left alone.
Creating the VM starts billing. See infra/README.md.

  gcloud auth login
  pwsh infra/gcp/setup.ps1
#>
[CmdletBinding()]
param(
  [string]$Project = "magnisale",
  [string]$Region = "europe-west1",
  [string]$Zone = "$Region-b",
  [string]$MachineType = "e2-small",
  [int]$DiskGb = 30,
  [string]$GithubRepo = "jjokah/magnisale",
  [string]$AppUrl = "https://app.magnisale.com"
)

$ErrorActionPreference = "Stop"

# gcloud.cmd where it exists, because gcloud.ps1 can mangle arguments on Windows.
$gcloudBin = (Get-Command gcloud.cmd -ErrorAction SilentlyContinue)?.Source ?? "gcloud"

$Vm = "magnisale-platform"
$Network = "magnisale"
$Subnet = "magnisale-$Region"
$Registry = "magnisale"
$SecretName = "magnisale-platform-env"
$Schedule = "magnisale-daily"
$Pool = "github"
$Provider = "github-actions"
$VmAccount = "magnisale-vm@$Project.iam.gserviceaccount.com"
$DeployAccount = "magnisale-deploy@$Project.iam.gserviceaccount.com"

function Invoke-Gcloud {
  & $gcloudBin --project $Project --quiet @args
  if ($LASTEXITCODE -ne 0) { throw "gcloud $($args -join ' ') failed." }
}

function Test-Gcloud {
  & $gcloudBin --project $Project --quiet @args *> $null
  return $LASTEXITCODE -eq 0
}

function Write-Step([string]$Text) { Write-Host "`n==> $Text" -ForegroundColor Cyan }

function New-RandomHex {
  $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
  return [System.Convert]::ToHexString($bytes).ToLowerInvariant()
}

$work = Join-Path ([System.IO.Path]::GetTempPath()) "magnisale-setup-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $work | Out-Null

try {
  Write-Step "Checking the project, billing and repository"
  $projectNumber = & $gcloudBin projects describe $Project --format="value(projectNumber)"
  if ($LASTEXITCODE -ne 0 -or -not $projectNumber) { throw "Cannot read project '$Project'. Run: gcloud auth login" }
  # The billing API is rate-limited for everyone using gcloud, so allow a retry.
  foreach ($attempt in 1..4) {
    $billing = & $gcloudBin billing projects describe $Project --format="value(billingEnabled)" 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 20
  }
  if ($LASTEXITCODE -ne 0) { throw "Could not check billing on '$Project'. Try again in a minute." }
  if ($billing -ne "True") { throw "Billing is not enabled on project '$Project'." }
  $repoId = gh api "repos/$GithubRepo" --jq .id
  if ($LASTEXITCODE -ne 0 -or -not $repoId) { throw "Cannot read GitHub repository '$GithubRepo'. Run: gh auth login" }

  Write-Step "Enabling the APIs"
  Invoke-Gcloud services enable compute.googleapis.com artifactregistry.googleapis.com `
    secretmanager.googleapis.com iap.googleapis.com iamcredentials.googleapis.com `
    sts.googleapis.com oslogin.googleapis.com

  Write-Step "Image registry"
  if (-not (Test-Gcloud artifacts repositories describe $Registry --location $Region)) {
    Invoke-Gcloud artifacts repositories create $Registry --repository-format docker --location $Region
  }
  $policyFile = Join-Path $work "cleanup.json"
  @(
    @{ name = "delete-old"; action = @{ type = "Delete" }; condition = @{ tagState = "any"; olderThan = "30d" } },
    @{ name = "keep-recent"; action = @{ type = "Keep" }; mostRecentVersions = @{ keepCount = 10 } }
  ) | ConvertTo-Json -Depth 5 -AsArray | Set-Content -Path $policyFile
  Invoke-Gcloud artifacts repositories set-cleanup-policies $Registry --location $Region --policy $policyFile --no-dry-run --format none

  Write-Step "Service accounts"
  foreach ($account in @(@("magnisale-vm", "Magnisale VM"), @("magnisale-deploy", "Magnisale deploys"))) {
    $email = "$($account[0])@$Project.iam.gserviceaccount.com"
    if (-not (Test-Gcloud iam service-accounts describe $email)) {
      Invoke-Gcloud iam service-accounts create $account[0] --display-name $account[1]
      Start-Sleep -Seconds 10  # New accounts take a moment to become usable in IAM.
    }
  }

  Write-Step "Application secrets"
  if (-not (Test-Gcloud secrets describe $SecretName)) {
    $envFile = Join-Path $work "platform.env"
    $lines = @(
      "APP_URL=$AppUrl",
      "POSTGRES_PASSWORD=$(New-RandomHex)",
      "APP_DB_PASSWORD=$(New-RandomHex)",
      "BETTER_AUTH_SECRET=$(New-RandomHex)"
    )
    # Unix line endings: the VM reads this file, and a stray \r would end up in every value.
    [System.IO.File]::WriteAllText($envFile, ($lines -join "`n") + "`n")
    Invoke-Gcloud secrets create $SecretName --replication-policy user-managed --locations $Region --data-file $envFile
    Remove-Item -Path $envFile -Force
  }

  Write-Step "Permissions"
  Invoke-Gcloud artifacts repositories add-iam-policy-binding $Registry --location $Region `
    --member "serviceAccount:$VmAccount" --role roles/artifactregistry.reader --format none
  Invoke-Gcloud artifacts repositories add-iam-policy-binding $Registry --location $Region `
    --member "serviceAccount:$DeployAccount" --role roles/artifactregistry.writer --format none
  Invoke-Gcloud secrets add-iam-policy-binding $SecretName `
    --member "serviceAccount:$VmAccount" --role roles/secretmanager.secretAccessor --format none
  Invoke-Gcloud iam service-accounts add-iam-policy-binding $VmAccount `
    --member "serviceAccount:$DeployAccount" --role roles/iam.serviceAccountUser --format none
  foreach ($role in "roles/compute.viewer", "roles/iap.tunnelResourceAccessor") {
    Invoke-Gcloud projects add-iam-policy-binding $Project `
      --member "serviceAccount:$DeployAccount" --role $role --condition None --format none
  }

  Write-Step "Keyless deploys from GitHub (main branch of $GithubRepo only)"
  if (-not (Test-Gcloud iam workload-identity-pools describe $Pool --location global)) {
    Invoke-Gcloud iam workload-identity-pools create $Pool --location global --display-name "GitHub Actions"
  }
  if (-not (Test-Gcloud iam workload-identity-pools providers describe $Provider --location global --workload-identity-pool $Pool)) {
    # A flags file, because this condition's quotes and && do not survive cmd.exe.
    $flagsFile = Join-Path $work "provider.json"
    @{
      "--location"                = "global"
      "--workload-identity-pool"  = $Pool
      "--display-name"            = "GitHub Actions"
      "--issuer-uri"              = "https://token.actions.githubusercontent.com"
      "--attribute-mapping"       = "google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref"
      "--attribute-condition"     = "assertion.repository_id == '$repoId' && assertion.ref == 'refs/heads/main'"
    } | ConvertTo-Json | Set-Content -Path $flagsFile
    Invoke-Gcloud iam workload-identity-pools providers create-oidc $Provider --flags-file $flagsFile
  }
  $poolName = "projects/$projectNumber/locations/global/workloadIdentityPools/$Pool"
  Invoke-Gcloud iam service-accounts add-iam-policy-binding $DeployAccount `
    --member "principalSet://iam.googleapis.com/$poolName/attribute.repository_id/$repoId" `
    --role roles/iam.workloadIdentityUser --format none

  Write-Step "Private network: SSH through Google's IAP only, nothing else inbound"
  if (-not (Test-Gcloud compute networks describe $Network)) {
    Invoke-Gcloud compute networks create $Network --subnet-mode custom
  }
  if (-not (Test-Gcloud compute networks subnets describe $Subnet --region $Region)) {
    Invoke-Gcloud compute networks subnets create $Subnet --network $Network --region $Region `
      --range 10.10.0.0/24 --enable-private-ip-google-access
  }
  if (-not (Test-Gcloud compute firewall-rules describe magnisale-allow-iap-ssh)) {
    Invoke-Gcloud compute firewall-rules create magnisale-allow-iap-ssh --network $Network `
      --direction INGRESS --action allow --rules tcp:22 --source-ranges 35.235.240.0/20
  }

  Write-Step "Daily disk snapshots, kept 14 days"
  if (-not (Test-Gcloud compute resource-policies describe $Schedule --region $Region)) {
    Invoke-Gcloud compute resource-policies create snapshot-schedule $Schedule --region $Region `
      --max-retention-days 14 --start-time 02:00 --daily-schedule `
      --on-source-disk-delete apply-retention-policy --storage-location $Region
  }

  Write-Step "The VM ($MachineType in $Zone)"
  if (-not (Test-Gcloud compute instances describe $Vm --zone $Zone)) {
    Invoke-Gcloud compute instances create $Vm --zone $Zone --machine-type $MachineType `
      --image-family debian-13 --image-project debian-cloud `
      --boot-disk-size "${DiskGb}GB" --boot-disk-type pd-balanced `
      --subnet $Subnet --service-account $VmAccount --scopes cloud-platform `
      --shielded-secure-boot --shielded-vtpm --shielded-integrity-monitoring `
      --deletion-protection --metadata enable-oslogin=TRUE `
      --metadata-from-file "startup-script=$(Join-Path $PSScriptRoot 'vm-startup.sh')"
  }
  $attached = & $gcloudBin --project $Project compute disks describe $Vm --zone $Zone --format="value(resourcePolicies)"
  if ("$attached" -notmatch $Schedule) {
    Invoke-Gcloud compute disks add-resource-policies $Vm --zone $Zone --resource-policies $Schedule
  }
  Invoke-Gcloud compute instances add-iam-policy-binding $Vm --zone $Zone `
    --member "serviceAccount:$DeployAccount" --role roles/compute.osAdminLogin --format none

  Write-Step "Done"
  Write-Host @"

Next, connect GitHub. Setting these turns on platform deploys from main:

  gh variable set GCP_PROJECT_ID -R $GithubRepo -b "$Project"
  gh variable set GCP_REGION -R $GithubRepo -b "$Region"
  gh variable set GCP_ZONE -R $GithubRepo -b "$Zone"
  gh variable set GCP_DEPLOY_SERVICE_ACCOUNT -R $GithubRepo -b "$DeployAccount"
  gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER -R $GithubRepo -b "$poolName/providers/$Provider"

Add the Cloudflare Tunnel token first:

  pwsh infra/gcp/set-secret.ps1 CLOUDFLARE_TUNNEL_TOKEN -Project $Project
"@
}
finally {
  Remove-Item -Path $work -Recurse -Force -ErrorAction SilentlyContinue
}
