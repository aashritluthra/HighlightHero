# HighlightHero

Transform your favorite sports moments into stylized, viral-ready animations with high-fidelity sound synchronization.

## Monorepo (Turborepo)

| App        | Path           | Stack    | Port |
|-----------|----------------|----------|------|
| **Web**   | `apps/web`     | Next.js  | 3000 |
| **Backend** | `apps/backend` | Python (FastAPI) | 8000 |

## Quick start

```bash
# Install root + web dependencies
npm install

# Set up Python backend (one-time)
cd apps/backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ../..

# Run all apps in dev
npm run dev
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8000  
- **API docs:** http://localhost:8000/docs  

## Scripts (from repo root)

| Command     | Description                    |
|------------|--------------------------------|
| `npm run dev`   | Start all apps in dev mode     |
| `npm run build` | Build all apps                 |
| `npm run lint`  | Lint all apps                  |
| `npm run clean` | Remove build artifacts & deps  |

## Project structure

```
HighlightHero/
├── apps/
│   ├── web/          # Next.js frontend
│   └── backend/      # Python video processing API
├── package.json      # Root workspace + Turbo
├── turbo.json
└── README.md
```
