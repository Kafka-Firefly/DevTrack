# DevTrack

DevTrack is a student project and task tracking app. This repository currently contains the initial React + Vite frontend and Django REST backend setup.

## Implemented

- React + Vite projects page with search and an empty state
- Create projects with a name, optional description, and optional target date
- View, edit, and delete projects from the projects page
- Django REST API to list and create projects at `/api/projects/`, and retrieve, update, or delete a project at `/api/projects/<id>/`
- Create, view, edit, delete, and filter tasks by status
- Set a task's project, status, priority, and optional due date
- Django REST API for task list and detail operations at `/api/tasks/`
- SQLite storage for local development
- Django health endpoint at `/api/health/`

## Planned

- Dashboard and reporting
- User registration and authentication
- Team workspaces

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

The API health endpoint is `http://127.0.0.1:8000/api/health/`.

For deployment, set a private `DJANGO_SECRET_KEY` environment variable. The checked-in fallback is only for local development.
