# DevTrack

DevTrack is a student project and task tracking app. This repository currently contains the initial React + Vite frontend and Django REST backend setup.

## Implemented

- React + Vite starter frontend
- Django development server with a JSON health endpoint at `/api/health/`
- SQLite configured for local development

## Planned

- Dashboard and project/task management screens
- User registration and authentication
- Create, edit, filter, and delete projects and tasks

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
