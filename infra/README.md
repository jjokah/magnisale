# Hosting

```
magnisale.com      → Cloudflare Worker (static files from apps/web)
app.magnisale.com  → Cloudflare → Tunnel → Google Cloud VM
                                            cloudflared → Caddy → API, workers, Postgres
```

- **The site** is a static Cloudflare Worker, so it stays up if the VM is down.
- **The VM has no public web ports.** `cloudflared` connects out to Cloudflare, and admin SSH goes through Google's IAP.
- **Deploys are automatic.** A push to `main` runs the checks in `.github/workflows/deploy.yml`, then ships whichever of the two changed. Each side stays off until its repo variable is set.
- **A failed platform release rolls back** to the previous one on its own.
- **Backups** are daily disk snapshots kept for 14 days, inside the 30-day deletion promise.

## First-time setup

Do these in order. Steps 1, 3 and 6 change live or billed systems.

### 1. Add the domain to Cloudflare

Create a free Cloudflare account and add `magnisale.com`. Cloudflare scans the existing DNS. Compare its list with Namecheap's **Advanced DNS** page, because a scan can miss records.

Keep these, all set to **DNS only** (grey cloud), or email stops working:

| Name | Type | Value |
|---|---|---|
| `@` | MX | `5 mx1-hosting.jellyfish.systems` |
| `@` | MX | `10 mx2-hosting.jellyfish.systems` |
| `@` | MX | `20 mx3-hosting.jellyfish.systems` |
| `@` | TXT | SPF, starting `v=spf1` |
| `@` | TXT | `google-site-verification=...` |
| `_dmarc` | TXT | `v=DMARC1; p=none;` |
| `default._domainkey` | TXT | DKIM, starting `v=DKIM1` |

Delete the four GitHub `A` records on `@` and the `www` CNAME to `jjokah.github.io`. Then add a **proxied** `AAAA` record: name `www`, value `100::`.

Under **Scrape Shield**, turn off **Email Address Obfuscation**. Leave **Rocket Loader** off. Both rewrite pages, and the platform's security policy would block what they inject.

### 2. Preview the site

```powershell
pnpm --filter @magnisale/web exec wrangler login
pnpm turbo run build --filter=@magnisale/web
pnpm --filter @magnisale/web deploy:preview
```

Open the `workers.dev` address it prints. This touches no domain.

### 3. Switch the nameservers

In Namecheap, under **Domain → Nameservers → Custom DNS**, enter the two nameservers Cloudflare gave you. Wait for Cloudflare to mark the zone **Active**. Send and receive a test email once it is.

### 4. Publish the site

```powershell
pnpm --filter @magnisale/web exec wrangler deploy --env=
```

In Cloudflare, under **Rules → Redirect Rules**, create a rule for `www`: wildcard request URL `https://www.*`, target `https://${1}`, status 301, preserve query string. Turn on **SSL/TLS → Edge Certificates → Always Use HTTPS**.

Delete the preview once the live site looks right:

```powershell
pnpm --filter @magnisale/web exec wrangler delete --env preview
```

### 5. Connect GitHub to Cloudflare

Create an API token from the **Edit Cloudflare Workers** template, limited to this account and the `magnisale.com` zone.

```powershell
gh secret set CLOUDFLARE_API_TOKEN -R jjokah/magnisale
gh variable set CLOUDFLARE_ACCOUNT_ID -R jjokah/magnisale -b "<account id>"
```

### 6. Create the Google Cloud side

The project needs billing enabled. This starts charges for the VM, disk and public IP address.

The project `magnisale` belongs to your personal Google account. A separate gcloud configuration keeps it apart from other projects' defaults:

```powershell
gcloud config configurations create magnisale --no-activate
$env:CLOUDSDK_ACTIVE_CONFIG_NAME = "magnisale"
gcloud auth login
gcloud config set project magnisale
pwsh infra/gcp/setup.ps1
```

The defaults are an `e2-small` in `europe-west1`. Choose the region before this step, because moving the VM later means moving the database. To change it, pass `-Region` and `-Zone`.

### 7. Create the tunnel

In Cloudflare, go to **Zero Trust → Networks → Tunnels** and create a `cloudflared` tunnel named `magnisale`. Copy the token from its install command, then store it:

```powershell
pwsh infra/gcp/set-secret.ps1 CLOUDFLARE_TUNNEL_TOKEN
```

Add a published application route to the tunnel: hostname `app.magnisale.com`, service `http://caddy:80`.

### 8. Turn on platform deploys

Run the `gh variable set` commands that `setup.ps1` printed, then start the first release:

```powershell
gh workflow run deploy.yml -R jjokah/magnisale -f target=platform
```

## Running it

```powershell
# Once per terminal, so gcloud uses the Magnisale account and project
$env:CLOUDSDK_ACTIVE_CONFIG_NAME = "magnisale"

# A shell on the VM
gcloud compute ssh magnisale-platform --zone europe-west1-b --tunnel-through-iap

# Change a setting, such as SMTP_URL or GOOGLE_CLIENT_ID. Applies on the next deploy.
pwsh infra/gcp/set-secret.ps1 SMTP_URL
gh workflow run deploy.yml -R jjokah/magnisale -f target=platform
```

On the VM, logs and status:

```bash
cd /opt/magnisale
sudo docker compose --env-file .env --env-file release.env -f compose.yaml ps
sudo docker compose --env-file .env --env-file release.env -f compose.yaml logs -f api
```

**Restoring a backup:** list snapshots with `gcloud compute snapshots list`, create a disk from one with `gcloud compute disks create`, and swap it in as the VM's boot disk while the VM is stopped. Practise this once before the pilot.

**Rotating secrets:** `set-secret.ps1` refuses the database passwords and `BETTER_AUTH_SECRET`. A database password must also be changed inside Postgres, and a new auth secret signs everyone out.

## Limits to design around

- Cloudflare's free plan caps a request body at 100 MB and waits about 100 seconds for a response. Profiler uploads should send one file per request, and long work belongs in the workers.
- `e2-small` has 2 GB of memory plus 2 GB of swap. If file parsing strains it in milestone 2, stop the VM and change it to `e2-medium`.
