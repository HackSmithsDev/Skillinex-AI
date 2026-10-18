# Web frontend

The web client is a React single-page application built with Vite. Its source
is under `src/`; API requests are centralized in `src/api/axios.js`, and the
feature screens are grouped under `src/pages/`.

## Requirements

- Node.js 20
- npm
- The Skillinex backend running locally or a reachable deployed API

## Local development

From this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL` in `.env.local` to the backend base URL. The example file
uses `http://localhost:8008`, matching the backend's local example
configuration. Vite prints the web client URL when the dev server starts.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview a previously built bundle |

The production Docker image runs `npm ci` and `npm run build`, then serves the
result through nginx. Do not commit `.env.local`, `node_modules/`, or `dist/`.