# CLAUDE.md

Guidance for working in this repo. Keep it current when architecture or conventions change.

## What this is

**Stidget CMS** — the admin dashboard for Stidget, a stickers & emojis service. This repo is a **client-only SPA** (React 19 + Vite + TypeScript). There is no backend here; it talks to a separate REST API via `VITE_API_URL`.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # preview the production build
npm run lint     # eslint .
```

There is no test setup. `npm run build` type-checks (`tsc -b`), so it's the closest thing to a verification step — run it after non-trivial changes.

## Environment

- `VITE_API_URL` — base URL of the backend REST API, **including the `/api` prefix** (e.g. `https://…/api`). Set in `.env` (gitignored). Because the prefix lives in the base URL, services call bare paths like `/hub`, `/stickers`, `/admin/users` — never write `/api/...` in a service. Without it, every request goes to a relative path and fails.

## Stack

React 19, Vite 8, TypeScript, Tailwind v4 (`@tailwindcss/vite`, no config file — theme lives in `src/index.css`), shadcn/ui (`radix-vega` style, `neutral` base — see `components.json`), React Router 7, axios, sonner (toasts), dayjs, lucide-react icons. `react-hook-form` + `zod` are installed but not yet used. Deploys to Vercel (`vercel.json` rewrites all paths to `/` for SPA routing).

Path alias: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig`).

## Architecture

Feature-based. Each feature under `src/features/<name>/` owns its pages, dialogs, and a service:

- `*.page.tsx` — route component
- `*.service.ts` — thin axios wrappers, the only place that names API endpoints
- dialogs (`upload-dialog.tsx`, `edit-dialog.tsx`, `user-details-dialog.tsx`) — modal CRUD forms

Shared pieces:
- `src/services/api.ts` — the single axios instance. A request interceptor attaches `Authorization: Bearer <admin_token>` from `localStorage`.
- `src/components/ui/` — shadcn/ui primitives. Add new ones via the shadcn CLI, don't hand-write.
- `src/components/protected-route.tsx` — route guard.
- `src/layout/admin-layout.tsx` — sidebar shell for authed pages.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge). `src/lib/dayjs.ts` — dayjs with `duration` + `relativeTime` plugins; import dayjs from here, not the package.
- `src/lib/api-error.ts` — `apiErrorMessage(error, fallback)` pulls the backend's `{ message }` off an axios error; use it in `catch` blocks.
- `src/types/` — shared interfaces.

### Routing (`src/App.tsx`)

- `/login` — public
- `/`, `/stickers`, `/emojis`, `/hub`, `/users` — wrapped in `ProtectedRoute` + `AdminLayout`
- `/stickers` and `/emojis` both render `<MediaPage type=... />` — the two are one unified feature distinguished by a `type` prop
- `/hub` renders `<HubPage />` — the curated Hub drops (see `src/features/hub/`)
- `*` → redirect to `/`

### Auth

JWT-in-localStorage under the key `admin_token`. Login (`POST /admin/login`) stores `data.token`. `ProtectedRoute` gates on **token presence only** — no expiry/validity check, and there is no 401 interceptor to auto-logout. If you add auth-failure handling, do it in `src/services/api.ts`.

## Backend API surface (inferred — this repo doesn't own it)

- `POST /admin/login` → `{ token }`
- `GET /health` → status object (`status`, `environment`, `uptime`, `timestamp`, `docs`, `services.{database,cloudinary}`)
- `GET|POST /{stickers|emojis}`, `PATCH|DELETE /{stickers|emojis}/:id`
- `GET /hub` (`{ data, meta }`, active items only), `GET /hub/:id`, `POST /hub`, `PATCH /hub/:id`, `DELETE /hub/:id` (soft delete) — all require an `ADMIN` JWT
- `GET /admin/users`, `GET /admin/users/:id`

Media create/update send **multipart `FormData`**: image file under field `image`, plus `name`, `category`, `tags` (a JSON-stringified array built from comma-separated input), and `isPremium` (stringified boolean). Images are stored on **Cloudinary** by the backend.

### Hub feature (`src/features/hub/`)

Admin CRUD for curated "Hub drops" — richer than media (author attribution, backdrop color, description, and e-paper device metadata: `dominantColor`, `targetWidth`, `targetHeight`, `colorMode`). Also multipart `FormData` with the image under field `image` (png/jpeg/webp, max **2 MB** — enforced client-side in `hub-form.ts` and by the backend).

- `hub-form.ts` — the `HubFormState` shape (all inputs backed by strings), `hubToForm()`, image validation, tag parsing. Shared by both dialogs.
- `hub-form-fields.tsx` — the shared presentational form (both create and edit render it). `colorMode` is a native `<select>` styled to match `Input` (no shadcn Select in the project).
- `upload-dialog.tsx` — create (`POST`); requires image + `name` + `authorHandle`; sends only populated optional fields.
- `edit-dialog.tsx` — update (`PATCH`); fetches `GET /hub/:id` on open to pre-fill, then **diffs against the fetched snapshot and sends only changed fields** (empty string clears nullable fields). Key rule baked in: **replacing the image rebuilds `imageMeta`, so device fields are re-sent to preserve them; with no new image, changed device fields are merged.** Empty diff → toast, no request (backend `400`s on "nothing to update").
- No admin list endpoint exists; the grid uses the shared `GET /hub`, so **soft-deleted drops are not listable and there's no restore.**

List responses are unwrapped inconsistently across services — media uses `res.data.data`, users uses `res.data` (with `res.data.data` for rows and `res.data.meta` for pagination). Check the specific service before assuming a shape.

## Conventions

- Files: kebab-case (`user-details-dialog.tsx`, `media.service.ts`).
- Services expose a plain object (`export const xService = { async method() {…} }`), one per feature, and are the only modules that reference endpoint strings.
- User feedback goes through `sonner`'s `toast`; catch axios errors and surface `error.response?.data?.message`.
- Data fetching is local component state + `useEffect` (no react-query / global store).
- Prefer the `@/` alias over relative imports for cross-directory references.

## Known rough edges (verify before relying on these)

- `health.service.ts` returns `res.data.status`, but `dashboard.page.tsx` treats that value as the full health object. One side is likely wrong — confirm the real `/health` response shape before touching either.
- Stray `console.log`s in `media.service.ts` and `edit-dialog.tsx`.
- `src/types/sticker.ts` and `src/types/emoji.ts` duplicate `MediaItem` and appear unused after the sticker/emoji unification.
- `README.md` is still the stock Vite template.
