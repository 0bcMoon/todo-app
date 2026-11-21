# Todo App

A project and task tracker with a Go HTTP backend, PostgreSQL storage, and a React/TypeScript frontend built with Vite. The API supports login/logout, projects, and task creation, updates, and deletion.

## Requirements

- Go 1.24.6 or a compatible newer toolchain, as specified by `go.mod`.
- Node.js and npm compatible with the locked frontend dependencies.
- A running PostgreSQL instance and an existing database.

## Local setup

From the repository root, configure a connection to your local database:

```sh
export DATABASE_URL='postgres://USER:PASSWORD@localhost:5432/todo?sslmode=disable'
export PORT=8080
go mod download
```

Replace the connection placeholders with your local credentials. The backend reads its environment directly; copying `env-example` to `.env` does not automatically load it. That example currently contains only `COOKIE_DOMAIN`, which the inspected authentication code does not use.

Build the frontend, then run the server from the repository root:

```sh
cd frontend
npm ci
npm run build
cd ..
go run .
```

Open `http://localhost:8080`. The backend applies `schema.sql` at startup and serves `frontend/dist/`. Frontend API calls use relative URLs, so serving the built UI from Go keeps the UI and API on the same origin. The Vite configuration currently has no API proxy for a separate development server.

## Account setup and current limitations

There is no public registration route. `main.go` includes a migration mode that seeds a hardcoded account; replace that mechanism with configurable local account creation before using it. Do not reuse its checked-in password.

This is a development project. The inspected authentication code returns the user model, including its password-hash field, from `/user`; logout clears the browser cookie without revoking the stored session. Address those behaviors before deploying with real users.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Sign in |
| DELETE | `/auth/logout` | Clear the login cookie |
| GET | `/user` | Current user |
| GET / POST | `/projects` | List or create projects |
| DELETE | `/projects/{projectID}` | Delete a project |
| GET | `/projects/{projectID}/todos` | List project tasks |
| POST | `/todos` | Create a task |
| PUT / DELETE | `/todos/{todoID}` | Update or delete a task |

Project, task, and user routes require the `session_token` cookie.

## Layout

- `main.go`, `routes.go`: server startup, routing, and frontend serving.
- `auth.go`, `db.go`, `handlers.go`: authentication, database operations, and request handlers.
- `schema.sql`: database schema.
- `frontend/src/`: React components, API client, and hooks.
