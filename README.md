# Onboarding Checklist App

Full-stack onboarding tracker built with React + FastAPI + PostgreSQL.

## Deployment Guides

- Ubuntu VPS (No Docker): [DEPLOYMENT_UBUNTU_VPS.md](DEPLOYMENT_UBUNTU_VPS.md)

## Features

- Authentication with JWT and role-based access (`admin`, `manager`, `developer`)
- Template management for onboarding tasks
- Checklist assignment and task completion tracking
- Manager reporting endpoints for team and progress visibility
- Docker Compose local stack (`frontend`, `backend`, `postgres`)

## Project Structure

- `onboarding-backend` FastAPI app, SQLAlchemy models, auth, and REST APIs
- `onboarding-frontend` React app with routing, auth context, and dashboard UI
- `docker-compose.yml` local multi-service runtime

## Backend Setup (Local)

```bash
cd onboarding-backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Environment variables:

- `DATABASE_URL` default: `sqlite:///./onboarding.db`
- `SECRET_KEY` default: `change-me-in-production`
- `ACCESS_TOKEN_EXPIRE_MINUTES` default: `60`

## Frontend Setup (Local)

```bash
cd onboarding-frontend
npm install
npm run dev
```

Frontend API base URL is read from `VITE_API_BASE_URL` and defaults to `http://localhost:8000/api`.

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Templates:

- `GET /api/templates`
- `POST /api/templates`
- `PUT /api/templates/{id}`
- `DELETE /api/templates/{id}`

Checklists:

- `POST /api/checklists/assign`
- `GET /api/checklists/user/{id}`
- `PUT /api/checklists/task/{id}`

Reports:

- `GET /api/reports/progress`
- `GET /api/reports/team-status`

## Docker Compose

```bash
docker compose up --build
```

## Start App (Quick Command Runbook)

Use this when you want to start everything in one go.

```powershell
cd d:/onboard-app
docker desktop start
docker compose up --build -d
docker compose ps
```

Verify endpoints:

```powershell
try { (Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 20).StatusCode } catch { $_.Exception.Message }
try { (Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing -TimeoutSec 20).Content } catch { $_.Exception.Message }
```

If something is not running:

```powershell
docker compose ps -a
docker compose logs backend --tail 200
docker compose logs frontend --tail 200
docker compose logs postgres --tail 200
```

Stop app:

```powershell
docker compose down
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`

## Demo Logins (Local)

Use these accounts for local demo/testing after `docker compose up --build -d`.

- Admin
	- Email: `demo.admin@example.com`
	- Password: `Demo@12345`
- Manager
	- Email: `demo.manager@example.com`
	- Password: `Demo@12345`
- Developer
	- Email: `demo.developer@example.com`
	- Password: `Demo@12345`

Note: these are development-only credentials. Rotate or replace them before any shared/staging environment use.

## Suggested 6-Week Delivery Plan

1. Week 1: finalize requirements, architecture, and schema refinement.
2. Week 2: complete backend auth and migrations.
3. Week 3: finish checklist + reporting APIs and backend tests.
4. Week 4: complete frontend dashboard and role-specific UX polish.
5. Week 5: integration tests and bug fixes.
6. Week 6: Docker hardening, deployment, CI/CD pipeline, docs.
