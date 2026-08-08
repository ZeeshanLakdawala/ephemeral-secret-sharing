# Secret Share

An ephemeral secret-sharing utility: a host opens a temporary room with a six-digit code, drops in credentials that everyone in the room sees instantly, and everything is destroyed automatically when the timer runs out.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/secret-share run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No environment variables or database are required to run this app.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Web: React + Vite, wouter, TanStack Query, Tailwind, shadcn/ui
- Validation: Zod
- API codegen: Orval (from OpenAPI spec)
- Real-time: Server-Sent Events

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract; everything below is generated from it
- `lib/api-client-react/src/generated/` — generated React Query hooks and TS types
- `lib/api-zod/src/generated/` — generated Zod schemas used for server-side validation
- `artifacts/api-server/src/lib/rooms.ts` — the in-memory room engine (rooms, secrets, presence, expiry)
- `artifacts/api-server/src/routes/rooms.ts` — room endpoints plus the SSE event stream
- `artifacts/secret-share/src/pages/` — landing (`home.tsx`) and room (`room.tsx`) screens
- `artifacts/secret-share/src/hooks/use-room-stream.ts` — SSE subscription that feeds the query cache
- `artifacts/secret-share/src/lib/session.ts` — per-room client session (role, participant id, host token)
- `artifacts/secret-share/src/index.css` — theme tokens

## Architecture decisions

- **Nothing is persisted, by design.** Rooms, secrets and participants live only in the API server's memory and are erased on expiry. There is no database, even though the workspace ships with one. Restarting the API server therefore wipes all active rooms.
- **SSE, not polling or WebSockets.** A single `GET /api/rooms/:code/events` stream pushes the full room state on every change, so clients never diff partial updates. The stream writes into the TanStack Query cache under the normal query key, so cached data and live data can never disagree.
- **Presence is derived from open streams,** not from join calls. A participant counts as present while their event stream is open, plus a short grace window so a browser refresh doesn't make them flicker out of the count.
- **Host authority is an unguessable host token** issued once at room creation and required for every secret mutation. There are no accounts, so this token is the only thing separating a host from a participant.
- **Expiry is enforced in three places:** a per-room timer, a periodic sweep as a safety net, and a check on every room lookup — so an expired room can never be read even if a timer is missed.

## Product

- Host creates a room with a chosen lifetime (1–120 minutes, default 5) and receives a six-digit code to read aloud.
- Participants join with that code, optionally giving a display name.
- The host can add, edit and delete secrets; every change reaches all participants in real time.
- Secret values are masked by default, with per-secret reveal and copy actions.
- The room screen always shows the code, a live countdown that signals urgency in its final minute, and the current participant count.
- When time runs out, all clients are ejected automatically and told the room and its secrets were destroyed.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Regenerating the API contract runs a chained typecheck of the generated libraries. The pinned Zod version does not support the `zod.int()` helper Orval emits for `type: integer`, so numeric fields in the spec use `type: number` and whole-number enforcement happens in the server logic.
- Avoid putting query parameters on an operation that already has path parameters: Orval names both generated types `<Operation>Params` and the duplicate export breaks the build. The host token for deleting a secret is sent in the request body for this reason.
- The web app must call the API through its artifact base path (`${import.meta.env.BASE_URL}api/...`). A root-relative `/api/...` URL escapes the artifact's path prefix and hits the wrong route.
