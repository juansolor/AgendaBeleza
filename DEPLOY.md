# Deploy quick guide

This file explains the minimal steps to prepare the project for deploy (GitHub Actions + Render) and the secrets/env vars required.

1) Quick checklist
- Push the branch you want to deploy (we use `juan`).
- Add required GitHub repository Secrets (see next section).
- Add required environment variables in Render for each service (backend/frontend).
- Trigger a workflow run (push) or deploy from Render.

2) GitHub Secrets (Repository -> Settings -> Secrets)
- `GHCR_USERNAME` — GitHub user used for pushing images (example: your username).
- `GHCR_TOKEN` — Personal Access Token (scopes: write:packages, repo if private).
- `GHCR_OWNER` — your GitHub user or org (used to name images: ghcr.io/<owner>/...)
- `DATABASE_URL` — Postgres connection string for production (used by CI migration job).
- `DB_SSL` — optional (`true`/`false`) if your Postgres requires SSL.

Notes:
- The publish workflow will build and push backend/frontend images to GHCR when you push to `juan`.
- If `DATABASE_URL` secret is present, the workflow will attempt to run migrations and seeds against it. If not present, migrations are skipped.

3) Render environment variables (set these in Render dashboard for the backend service)
- `NODE_ENV=production`
- `DATABASE_URL` (if you use Postgres on Render)
- `JWT_SECRET` (production JWT secret)
- `CORS_ORIGIN` (frontend URL served by Render)
- `FLEXIBLE_SCHEDULING=false` (recommended default)
- Any other secrets (SMTP creds, third-party APIs).

Important: sqlite is used as a local/dev fallback. For production use a managed Postgres. Filesystem in Render is ephemeral and not suitable for sqlite persisted data.

4) How CI + Deploy works (short)
- Workflow `publish-docker.yml` (on push to `juan`):
  1. Buildx + QEMU setup.
  2. Login to GHCR and push backend and frontend Docker images.
  3. If `DATABASE_URL` secret exists, a follow-up job will run migrations and seeds using `sequelize-cli` against the provided DB.

5) Common commands (run locally)
- Install backend deps

```powershell
cd backend/api
npm install
```

- Run migrations (sqlite by default)

```powershell
npx sequelize-cli db:migrate
```

- Run seed (create admin)

```powershell
npx sequelize-cli db:seed:all
```

- Run tests

```powershell
npm test
```

- Build frontend

```powershell
cd frontend/vite-app
npm install
npm run build
```

- Build Docker images locally (optional)

```powershell
docker build -t agenda-beleza-backend:local -f backend/api/Dockerfile backend/api
docker build -t agenda-beleza-frontend:local -f frontend/vite-app/Dockerfile frontend/vite-app
```

6) Post-deploy smoke checklist
- Confirm frontend is reachable and CORS allows it to call API.
- Create a test client and create an appointment.
- Check Render logs for migration errors or missing env vars.

7) Next improvements (optional)
- Add automatic backups for Postgres.
- Add a staging environment and use a protected branch for production deploys.
- Add E2E tests (Cypress) to the CI pipeline and run them against a temporary deployed preview.

If you want, I can add a small GitHub Actions job that notifies Slack/Teams after a successful deploy or a manual protection step before running migrations.
