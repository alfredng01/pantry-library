# Pantry Library

Quickly locate pantry items by name, shelf, and bin.

## Run with Docker Compose

Requires Docker with the Compose plugin. From the project root:

```bash
docker compose up --build
```

- App: http://localhost:8080
- API (direct): http://localhost:3001

Data is persisted in a named Docker volume (`pantry-data`), so it survives container restarts. To copy this setup to another machine, copy the whole project directory (or `git clone` it) and run the same command — no other setup required.

To stop:

```bash
docker compose down
```

To stop and wipe the stored data:

```bash
docker compose down -v
```

## Local development (without Docker)

```bash
npm install
npm --prefix client install
npm --prefix server install
npm run dev
```

- Client (Vite dev server): http://localhost:5173
- Server: http://localhost:3001
