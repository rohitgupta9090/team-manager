# Team Task Manager

A small team task–tracking app with a JWT‑secured REST API and a React single‑page frontend.

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Backend** | Python 3, Django 6, Django REST Framework, SimpleJWT, django-cors-headers, dj-database-url, Gunicorn |
| **Database** | SQLite; PostgreSQL in production via `DATABASE_URL` (psycopg 3) |
| **Frontend** | React 19 
| **Static SPA server** | `serve` for production‑style builds |

---

## Repository layout

- `backend/` — Django project (`manage.py`, `core/`, `users/`, `projects/`, `tasks/`)
- `frontend/` — Vite React app (`src/`, env via `VITE_*`)

---

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env

python manage.py migrate
python manage.py runserver
```

API base URL: **`http://127.0.0.1:8000`**

Without `DATABASE_URL`, Django uses **`backend/db.sqlite3`**.

### Frontend

```powershell
cd frontend
copy .env.example .env

npm install
npm run dev
```

Use **`VITE_API_URL=http://127.0.0.1:8000`** in `frontend/.env` (matches the example).

---

## Environment variables

| Variable | Where | Purpose |
|----------|------|---------|
| `DATABASE_URL` | Backend only | PostgreSQL connection string (`postgresql://…`) when not using SQLite |
| `DJANGO_DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS` | Backend | Production settings; see `backend/.env.example` |
| `VITE_API_URL` | Frontend (build‑time) | HTTP(S) origin of the Django API, no trailing slash |

---

## Deploy notes

- Frontend build: `npm ci` / `npm install` then `npm run build`; serve the **`dist`** output (see `frontend/package.json` `start`).
- Backend: apply migrations against the production database (`python manage.py migrate --noinput`) before or at deploy; run the app behind a WSGI server (e.g. Gunicorn) bound to **`0.0.0.0:$PORT`** if the platform provides `PORT`.
- `DATABASE_URL` must begin with **`postgresql://`** or **`postgres://`**; use the full variable from the database service, not a bare host‑and‑port string.
