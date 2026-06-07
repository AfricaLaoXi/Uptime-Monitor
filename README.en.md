# Uptime Monitor

English | [中文](README.md)

Uptime Monitor is a lightweight website monitoring system built on Cloudflare Workers, Pages, and D1. It supports multi-site uptime checks, SSL certificate and domain expiration checks, multiple notification channels, a public status page, and an admin dashboard.

The project can run within Cloudflare's free tier and does not require a self-hosted server. The frontend uses bundled fonts and icons instead of runtime Google Fonts or icon CDN dependencies, making it friendlier for users in mainland China.

## Features

- HTTP/HTTPS monitoring for multiple sites, with GET/POST, custom headers, request bodies, and keyword checks.
- SSL certificate and domain expiration monitoring with independent toggles and alert thresholds.
- Notifications through WeCom, Feishu, DingTalk, custom Webhook, Telegram, and Email.
- Configurable alert templates with separate incident and recovery messages.
- Public status page with tag grouping, announcements, and custom logo support.
- Admin dashboard with bulk actions, drag-and-drop sorting, JSON import/export, and health checks.
- Session-based admin authentication so the frontend does not keep a plaintext password.
- `ALLOWED_ORIGIN` support for Worker and Pages proxy CORS hardening.
- GitHub Actions deployment for both Worker and Pages.

## Screenshots

<div align="center">
  <img src="img/Uptime-Monitor-pc.png" alt="Status page" width="100%">
  <br>
  <em>Public status page</em>
</div>

<br>

<div align="center">
  <img src="img/Uptime-Monitor-admin.png" alt="Admin dashboard" width="100%">
  <br>
  <em>Admin dashboard</em>
</div>

## Tech Stack

| Area | Technology |
|---|---|
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 |
| Frontend | Vue 3 + Vite + Tailwind CSS |
| Edge proxy | Cloudflare Pages Functions |
| Deployment | Wrangler + GitHub Actions |

## Requirements

- Cloudflare account
- Node.js 22 or later
- npm
- Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

Clone the repository:

```bash
git clone https://github.com/nianshu2022/Uptime-Monitor.git
cd Uptime-Monitor
```

## Create a D1 Database

Create a database:

```bash
npx wrangler d1 create uptime-db
```

The command output includes a `database_id` value, which is required for deployment:

```toml
[[d1_databases]]
binding = "DB"
database_name = "uptime-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Initialize the schema:

```bash
npx wrangler d1 execute uptime-db --remote --file=worker/schema.sql
```

If you already have a D1 database, copy the Database ID from the Cloudflare Dashboard D1 detail page, or run:

```bash
npx wrangler d1 list
```

For existing databases, run `worker/schema.sql` again. The `CREATE INDEX IF NOT EXISTS` statements will add missing indexes without recreating existing ones.

## Manual Deployment

### 1. Configure and deploy the Worker

```bash
cd worker
npm install
cp wrangler.example.toml wrangler.toml
```

Edit `worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "uptime-db"
database_id = "your D1_DATABASE_ID"

[vars]
ADMIN_API_KEY = "your admin login secret"
ALLOWED_ORIGIN = "https://your-pages-domain.pages.dev"
SESSION_TTL_HOURS = "12"
```

Keep `binding` as `DB`.

Deploy the Worker:

```bash
npx wrangler deploy
```

Copy the Worker URL from the command output, for example:

```text
https://uptime-worker.example.workers.dev
```

### 2. Build and deploy the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run build
npx wrangler pages deploy dist --project-name=uptime-monitor
```

### 3. Configure Pages environment variables

Open Cloudflare Dashboard:

`Workers & Pages` -> `uptime-monitor` -> `Settings` -> `Environment variables`

Add:

| Variable | Description |
|---|---|
| `WORKER_URL` | Worker URL, for example `https://uptime-worker.example.workers.dev` |
| `ALLOWED_ORIGIN` | Pages URL, for example `https://uptime-monitor.pages.dev` |

Save the variables and redeploy the frontend:

```bash
npx wrangler pages deploy dist --project-name=uptime-monitor
```

## GitHub Actions Deployment

After forking this repository, configure the following values in GitHub repository `Settings` -> `Secrets and variables` -> `Actions`.

### Secrets

| Name | Required | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare Account ID |
| `D1_DATABASE_ID` | Yes | D1 Database ID |
| `ADMIN_API_KEY` | Yes | Admin login secret |
| `VITE_CF_ANALYTICS_TOKEN` | No | Cloudflare Web Analytics Token |

The Cloudflare API Token should include at least:

| Permission | Level |
|---|---|
| Account / Workers Scripts | Edit |
| Account / Cloudflare Pages | Edit |
| Account / D1 | Edit |
| Account / Account Settings | Read |

### Variables

| Name | Required | Description |
|---|---|---|
| `ALLOWED_ORIGIN` | Recommended | Pages URL for CORS hardening |
| `SESSION_TTL_HOURS` | No | Admin session lifetime, defaults to 12 hours |
| `VITE_FOOTER_AUTHOR` | No | Footer author name |
| `VITE_FOOTER_URL` | No | Footer author URL |

After configuration, push to the `main` branch or manually run the `Deploy Uptime Monitor` workflow in the Actions tab.

After the first deployment, add `WORKER_URL` to the Cloudflare Pages project environment variables and redeploy the frontend once.

## Local Development

Start the Worker:

```bash
cd worker
npm install
npm run dev
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

- Status page: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/admin.html`
- Worker: `http://127.0.0.1:8787`

## Mainland China Access Notes

The `workers.dev` domain may not be directly reachable from mainland China. The recommended setup is to deploy the frontend to Cloudflare Pages and let the Pages proxy forward `/api/*` requests to the Worker.

For better stability, bind custom domains:

- Worker: `Workers & Pages` -> Worker -> `Settings` -> `Domains & Routes`
- Pages: `Workers & Pages` -> Pages project -> `Custom domains`

The project does not depend on paid third-party services. Telegram, Email, `crt.sh`, and `rdap.org` may be affected by local network conditions. For mainland China users, WeCom, Feishu, DingTalk, or a custom Webhook are recommended first.

## FAQ

### GitHub Actions reports Cloudflare Authentication error

This usually means GitHub Secrets are incorrect or the API Token does not have enough permissions. Check:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- Workers, Pages, D1, and Account Settings permissions
- Whether the token resource scope includes the target Cloudflare account

### Worker throws Cannot read properties of undefined (reading 'prepare')

D1 is not bound correctly. Check:

- `binding` in `worker/wrangler.toml` is `DB`
- `database_id` is correct
- `D1_DATABASE_ID` is configured in GitHub Actions

### Admin login says authentication is not configured

Set `ADMIN_API_KEY`. The old `ADMIN_PASSWORD` variable is still supported, but `ADMIN_API_KEY` is recommended.

### `/api/monitors/public` returns the frontend page

The Pages proxy does not have the Worker URL. Set `WORKER_URL` in Cloudflare Pages environment variables, save it, and redeploy the frontend.

## Project Structure

```text
Uptime-Monitor/
├── frontend/
│   ├── public/
│   │   └── _worker.js
│   ├── index.html
│   ├── admin.html
│   ├── vite.config.js
│   └── package.json
├── worker/
│   ├── src/index.ts
│   ├── schema.sql
│   ├── wrangler.example.toml
│   └── package.json
├── .github/workflows/
│   └── deploy.yml
├── README.md
├── README.en.md
└── LICENSE
```

## License

This project is licensed under the [MIT License](LICENSE).
