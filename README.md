# DevTrack

DevTrack is a student project and task tracking app built with React, Vite, Django REST Framework, and SQLite. It includes project and task management plus a workspace dashboard based on saved data.

## Implemented

- React + Vite projects page with search and an empty state
- Create projects with a name, optional description, and optional target date
- View, edit, and delete projects from the projects page
- Django REST API to list and create projects at `/api/projects/`, and retrieve, update, or delete a project at `/api/projects/<id>/`
- Create, view, edit, delete, and filter tasks by status
- Set a task's project, status, priority, and optional due date
- Django REST API for task list and detail operations at `/api/tasks/`
- Workspace dashboard with project and task totals, overdue and upcoming tasks, status breakdown, and per-project completion
- Username and password registration, login, session-based sign-in, and sign-out
- Project and task data isolated per account
- CSRF protection on account and data-changing requests
- SQLite storage for local development
- Production configuration for PostgreSQL, WhiteNoise static files, and Render Blueprint deployment
- Django health endpoint at `/api/health/`

## Planned

- Advanced reporting and charts
- Team workspaces
- Password reset and email verification
- Publish and verify the live demo

Deleting a project also deletes its tasks.

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+

On Windows, if `py --version` does not show a Python version, install Python with the official [Python Install Manager](https://www.python.org/downloads/), then close and reopen PowerShell and check `py --version` again.

## Run locally

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The frontend is available at `http://127.0.0.1:5173/`; the API health endpoint is `http://127.0.0.1:8000/api/health/`.

Create an account from the sign-in screen. DevTrack uses Django session cookies, so your browser stays signed in during development and each account only sees its own projects and tasks. Use a strong password; password reset and email verification are not implemented yet.

For deployment, set a private `DJANGO_SECRET_KEY` environment variable. The checked-in fallback is only for local development.

## Deploy a demo

The repository includes a Render Blueprint and a multi-stage Dockerfile. Render builds the React bundle with Node.js, then serves it with Django from one origin so session cookies and CSRF protections work without cross-site frontend cookies. Docker is used by Render during deployment; it is not required on your Windows computer for local development.

1. Create a PostgreSQL project on [Neon](https://neon.tech/) and copy its connection string. Keep the string private.
2. In Render, create a new Blueprint from `Kafka-Firefly/DevTrack` on the `main` branch. The Blueprint uses Render's free web-service plan; no paid plan is selected in this repository.
3. When Render asks for `DATABASE_URL`, paste the Neon connection string. The Blueprint generates `DJANGO_SECRET_KEY` and configures Django with debug mode off.
4. Wait for the build and deploy to finish, then open the service URL. The health endpoint is `/api/health/`.
5. Register a new account on the deployed app. Local SQLite accounts and projects are not copied to the production database.

The free Render web service sleeps after 15 minutes without traffic, so its first request after idle can take about a minute. Neon Free suspends database compute after 5 minutes without activity and wakes it again when the database is queried. Render's own free PostgreSQL databases expire after 30 days, which is why this setup uses Neon for the database. These plan limits can change; check [Render free service limits](https://render.com/docs/free) and [Neon pricing](https://neon.com/pricing) before deploying. The `DATABASE_URL` stays out of this repository and is supplied privately in Render.
