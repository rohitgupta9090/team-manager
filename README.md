# Team Task Manager (Full-Stack)

Full-stack assignment stack: **Django REST API** + **SQLite** + **React (Vite, Tailwind)**. Covers authentication, Admin/Member RBAC, projects, tasks with assignment and statuses, dashboard stats, and overdue tracking.

---

## Run locally

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env

python manage.py migrate
python manage.py runserver
```

API listens at **http://127.0.0.1:8000** by default.

- **SQLite** is used automatically when `DATABASE_URL` is not set (`db.sqlite3` next to `manage.py`).
- Optional Postgres: set `DATABASE_URL` in `.env` (recommended later for Railway).

### Frontend

```powershell
cd frontend
copy .env.example .env

npm install
npm run dev
```

Set **`VITE_API_URL=http://127.0.0.1:8000`** in `frontend/.env` (already the example default).

---

## Assignment features

| Requirement | Implementation |
|-------------|------------------|
| **Signup / Login** | JWT (`POST /api/signup`, `POST /api/login`). Login ID is your **email** (`username`). **Member vs Administrator**: signup sends persisted `role`; login sends optional `expected_role` that **must match** stored RBAC or the API rejects. |
| **REST API + DB** | Django REST Framework; relational models (`User`, `Project`, `Task`). |
| **RBAC Admin / Member** | `users.User.role` set at signup (`role`). Admins can still open **Admin · Users & roles** to create either role. |
| **Admin** | Create projects; create tasks; assign members; edit any task status. |
| **Member** | See projects; on a project page see **only assigned** tasks; change status on **own** tasks. |
| **Dashboard** | Totals for all / assigned tasks (by role): total, completed, pending, **overdue**. |
| **Overdue** | Tasks with `due_date` before today and status not **done**, scoped like other stats (admin: all tasks; member: own). |
| **Validation** | Non-empty trimmed project names and task titles; password min length on signup/admin create user. |

---

## Useful paths (authenticated unless noted)

- `GET /api/me/` — current user (`role`, `email`, …)
- `GET /api/dashboard/` — stats + `overdue_items` preview list
- `GET|POST /api/projects/` — list / create project (POST admin only)
- `GET /api/projects/<id>/` — project detail
- `GET|POST /api/tasks/` — list (filter `?project_id=`) / create (POST admin only)
- `PATCH /api/tasks/<id>/` — status (assignee or admin)
- `GET /api/members/` — list users (admin only)
- `POST /api/admin/users/` — create user with `role` (admin only)

---

## Repo layout

| Path | Purpose |
|------|---------|
| `frontend/` | React SPA |
| `backend/` | Django API + JWT |
| `supabase/schema.sql` | Legacy/reference only if you use Supabase |

