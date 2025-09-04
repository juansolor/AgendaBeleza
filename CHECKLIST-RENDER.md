Predeploy checklist for Render (AgendaBeleza)

1) Repository readiness
   - [ ] All changes committed and pushed to the `juan` branch (or to the branch you will link to Render).
   - [ ] `render.yaml` exists at project root and references both services.

2) Backend (backend/api)
   - [ ] Ensure `backend/api/package.json` scripts include a `start` script (currently `node app.js`).
   - [ ] Ensure `.env` or Render env vars include:
       - `NODE_ENV=production`
       - `PORT` (Render provides one automatically; optional override)
       - `FLEXIBLE_SCHEDULING=false` (recommended)
       - Any JWT secrets, DB credentials if moving from sqlite to Postgres
   - [ ] Replace sqlite with a managed DB for production (optional but recommended):
       - Create a Render Postgres service and add connection string to env (e.g., DATABASE_URL)
       - Update `backend/api/database/db.js` to use DATABASE_URL when present
   - [ ] Ensure `app.js` exposes a health endpoint at `/health` (added).

3) Frontend (frontend/vite-app)
   - [ ] `frontend/vite-app/package.json` must have `build` script (`vite build`) and `preview` if needed.
   - [ ] `render.yaml` config uses `buildCommand: npm install && npm run build` and `publishPath: dist` (added).
   - [ ] If the frontend needs API_BASE_URL, add an env var in Render and read it at runtime or bake it at build time.

4) Static assets and CORS
   - [ ] Set `CORS_ORIGIN` in backend env to the frontend URL provided by Render (or set to `*` temporarily).

5) Security / Secrets
   - [ ] Add JWT_SECRET, SALT_ROUNDS or other secrets into Render's environment variables (do not commit them).

6) Tests and build
   - [ ] Run backend tests: `cd backend/api && npm test` (should pass)
   - [ ] Run frontend build: `cd frontend/vite-app && npm run build` (should produce `dist/`)

7) Post-deploy smoke checks
   - [ ] Visit frontend URL and exercise core flows (list services, select date, create appointment, admin login).
   - [ ] Check logs in Render for any startup errors (missing env var, DB connection issues).

Notes:
- sqlite is file-based and not suitable for multiple instances or long-term storage on Render (ephemeral disk). Consider moving to Postgres for production.
- If you prefer Docker, you can provide two Dockerfiles (backend and frontend) and update `render.yaml` to use Docker builds.

If you want, I can:
- Auto-apply the contrast fixes reported by `scripts/fix-contrast-whites.js` and commit them.
- Create a Postgres migration and update `database/db.js` to use `DATABASE_URL` when present.
- Add a simple `Dockerfile` for the backend and/or frontend.
- Create a GitHub Actions workflow to run tests and build before deployment.

8) Docker & CI (added)
   - [x] Dockerfiles were added for backend and frontend (`backend/api/Dockerfile`, `frontend/vite-app/Dockerfile`).
   - [x] `render.yaml` updated to reference these Dockerfiles so Render builds images.
   - [x] GitHub Actions workflow added at `.github/workflows/ci.yml` to run backend tests and build the frontend on pushes/PRs to `main` and `juan`.
