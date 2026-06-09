# Running Plan

A small single-page web app for a **10-week "0 → 30 minutes non-stop running"**
beginner plan. Browse each week's sessions, tick them off as you go, and watch
your overall progress fill up. Progress is saved in your browser so it survives
a reload, and — when Supabase is configured — syncs across your devices via an
unguessable **sync code**.

This repo is intentionally set up as a clean, learnable example of a modern
frontend project with a full **dev → test → containerize → deploy** cycle.

## Tech stack

| Concern       | Choice                                  |
| ------------- | --------------------------------------- |
| Build tool    | [Vite](https://vitejs.dev/)             |
| UI            | React 18 + TypeScript                   |
| Styling       | CSS Modules (palette via CSS variables) |
| Tests         | Vitest + React Testing Library          |
| Lint          | ESLint (flat config) + Prettier         |
| Sync          | Supabase (optional cross-device store)  |
| Container     | Multi-stage Docker → nginx              |
| Orchestration | Kubernetes manifests (`k8s/`)           |
| CI / Deploy   | GitHub Actions → GitHub Pages           |

## Project structure

```
src/
  data/          # the plan content (weeks, tips) — typed data, no UI
  hooks/         # useProgress (completion state + sync), useSyncCode
  lib/           # supabase.ts — client (null when env unset → local-only)
  components/    # one folder per component (.tsx + .module.css [+ .test])
  styles/        # global.css — palette CSS variables + reset
  types.ts       # Session / Week / Tip interfaces
public/CNAME     # custom domain for GitHub Pages (troyborg.dk)
Dockerfile       # build (node) → serve (nginx)
nginx/           # nginx server config (SPA fallback, gzip, /healthz)
k8s/             # Namespace, Deployment, Service, Ingress
.github/         # CI + GitHub Pages deploy workflows
```

## The change cycle

### 1. Local development (hot reload)

```bash
npm install
npm run dev          # http://localhost:5173
```

Edit anything under `src/` and the browser updates instantly.

### 2. Quality checks

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest run  (npm run test:watch while developing)
npm run format       # prettier --write .
```

### 3. Production build preview

```bash
npm run build        # outputs static files to dist/
npm run preview      # serves the built app at http://localhost:4173
```

### 4. Run as a container

```bash
docker compose up --build    # http://localhost:8080
```

This builds the multi-stage image (Node builds the site, nginx serves it) and
runs it. Equivalent manual steps:

```bash
docker build -t running-plan:latest .
docker run --rm -p 8080:80 running-plan:latest
```

### 5. Deploy to Kubernetes

Build the image and make it available to your cluster, then apply the manifests:

```bash
docker build -t running-plan:latest .

# Load the local image into your cluster:
minikube image load running-plan:latest      # minikube
# kind load docker-image running-plan:latest  # kind

kubectl apply -f k8s/
```

Reach the app:

```bash
# Simplest — no ingress controller needed:
kubectl -n running-plan port-forward svc/running-plan 8080:80
# → http://localhost:8080
```

Or enable an ingress controller and apply `k8s/ingress.yaml` (see comments in
that file for the `running-plan.local` host setup).

## How it works

- **Plan content** lives in `src/data/weeks.ts` and `src/data/tips.ts` as plain
  typed arrays — change the plan without touching any UI code.
- **`useProgress`** (`src/hooks/useProgress.ts`) owns which sessions are done,
  keyed by `"<weekIndex>-<sessionIndex>"`, and mirrors that map to
  `localStorage` so it persists across reloads.
- **Cross-device sync** is layered on top: when `VITE_SUPABASE_*` are set, the
  hook also reads/writes a Supabase row keyed by a per-browser **sync code**
  (`useSyncCode`), pulling on load and tab-focus and pushing (debounced) on
  change. With no config it silently runs local-only. Paste another device's
  code in the **Device sync** panel to share progress.
- **Components** are small and presentational; `RunningPlan` is the only one
  holding state (the active week + the progress hook).

## CI / Deploy

- `.github/workflows/ci.yml` runs typecheck → lint → test → build on every push
  and pull request, then verifies the Docker image builds.
- `.github/workflows/deploy.yml` builds and publishes the static site to
  **GitHub Pages** on every push to `main` (see _Hosting on a custom domain_).

## Hosting on a custom domain (GitHub Pages)

The site is a pure static SPA, so it's hosted free on GitHub Pages at
[troyborg.dk](https://troyborg.dk). One-time setup:

1. **Supabase** — create a project and run the table + policies:
   ```sql
   create table public.progress (
     id text primary key,
     data jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );
   alter table public.progress enable row level security;
   create policy "anon read"   on public.progress for select to anon using (true);
   create policy "anon insert" on public.progress for insert to anon with check (true);
   create policy "anon update" on public.progress for update to anon using (true) with check (true);
   ```
   > Access is gated only by the unguessable sync code (no login). Fine for
   > running progress; for stronger guarantees switch to Supabase auth + RLS
   > keyed on `auth.uid()`.
2. **GitHub repo settings** — repo must be **public** (free Pages); add Actions
   secrets `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; set **Pages → Source
   = GitHub Actions**.
3. **Push to `main`** — `deploy.yml` builds (injecting the secrets) and
   publishes. `public/CNAME` keeps the custom domain across deploys.
4. **DNS** at your registrar — point the apex `@` at GitHub Pages' four A
   records (`185.199.108–111.153`) and `www` via CNAME to `theistj.github.io`.
5. **Pages → Custom domain** = `troyborg.dk`, then tick **Enforce HTTPS** once
   DNS resolves (GitHub auto-provisions the certificate).

Local dev/tests need no Supabase config — copy `.env.example` to `.env` only if
you want to exercise sync locally.
