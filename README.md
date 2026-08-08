# 🔐 Ephemeral Secret Sharing

A lightweight, real-time tool for temporarily sharing secrets — API keys, tokens, passwords, and connection strings — with a group of people, then having everything vanish on its own.

No accounts. No sign-up. No database. No permanent storage.

The host spins up a room that self-destructs in minutes, reads a six-digit code out loud, and drops in credentials that everyone in the room sees instantly. When time runs out — or the host disconnects — the room and every secret in it are destroyed.

---

## Why this exists

Sharing a credential securely in person is surprisingly awkward. You read it aloud (now everyone's typing), paste it in chat (now it's in a chat log forever), or write it on a whiteboard (now it's a photo in someone's camera roll). Tossed-off credentials end up scattered across chat history, sticky notes, and screenshots — none of which ever expire.

Ephemeral Secret Sharing gives a workshop host an in-memory room where temporary credentials live for exactly as long as they're needed, then are gone. Nothing is written to disk, nothing survives the room's lifetime, and nothing outlives the session that created it.

## Key features

- **Instant rooms** — Create a room in one click and get a six-digit code to read aloud.
- **Real-time delivery** — Secrets appear on every participant's screen within a second of being added, with no reloading.
- **Secure by default** — Secret values are masked until revealed, keeping them safe from shoulder-surfing.
- **One-tap copy** — Every secret has a copy button with clear success feedback.
- **Full host control** — Hosts can add, edit, and delete secrets; participants see them read-only.
- **Live presence** — The room shows the current participant count in real time.
- **Visible countdown** — A ticking timer keeps everyone aware of how long is left, and signals urgency in the final minute.
- **Automatic destruction** — When the countdown hits zero **or the host disconnects**, the room, its secrets, and all participant state are erased from memory.

## How it works

1. A **host** opens the app and creates a room, optionally choosing how long it lives (1–120 minutes, default 5).
2. The app shows a unique six-digit **room code** and a live countdown.
3. **Participants** enter the code (and optionally a display name) to join.
4. The host adds labels and values. Every secret is broadcast to all connected participants over a **Server-Sent Events (SSE)** stream — no polling.
5. Participants copy what they need. Values are masked until revealed.
6. When the timer expires **or the host leaves / closes the tab**, the server destroys the room and disconnects everyone.

## User workflow

**Host**
1. Open the app → **Host Room** → choose a lifetime → **Create**.
2. Read the six-digit code aloud.
3. Add, edit, or delete secrets as needed.
4. Leave the room (or let it expire) when done — everything is destroyed.

**Participant**
1. Open the app → **Join Room**.
2. Enter the code (optionally add your name) → **Join**.
3. Watch secrets appear live, reveal them, and copy what you need.
4. When the room ends, you're returned to the join screen with a clear notice.

## Architecture

```
┌────────────────────────── web artifact ──────────────────────────┐
│  React + Vite SPA (static)                                       │
│   • Landing (create / join)                                      │
│   • Room screen (host & participant views)                       │
│   • SSE listener feeds the React Query cache                     │
└───────────────┬────────────────────────────────┬─────────────────┘
                │ static SPA                     │ /api (SSE + REST)
┌───────────────▼────────────────────────────────▼─────────────────┐
│                      API server (Express 5)                      │
│   • In-memory room engine (rooms, secrets, presence, expiry)     │
│   • Server-Sent Events stream per participant                    │
│   • Zod-validated request/response via shared OpenAPI contract   │
└──────────────────────────────────────────────────────────────────┘
                    (no database, no external storage)
```

- **Contract-first.** The API is defined in an OpenAPI spec (`lib/api-spec/openapi.yaml`). Orval generates the typed React Query client (`lib/api-client-react`) and the Zod validation schemas (`lib/api-zod`) from it, keeping the client and server in lockstep.
- **Real-time via SSE, not WebSockets.** A single `GET /api/rooms/:code/events` stream pushes the full room state on every change. The client writes each snapshot straight into the React Query cache, so cached and live data never disagree.
- **Presence is derived from open streams.** A participant counts as present while their event stream is open (plus a short grace window across a refresh), so the participant count reflects real connections.
- **In-memory only.** Rooms live in the API server's memory and are destroyed on expiry or host disconnect. There is deliberately no database, in line with the product's "nothing is stored" promise.
- **Host authority via a token.** Each room issues an unguessable host token at creation; secret mutations require it. There are no accounts.

### Project structure

```
artifacts/
  secret-share/            # React + Vite web app (frontend)
    src/pages/             # Home, Room, NotFound
    src/hooks/             # SSE stream hook, toast
    src/components/        # Countdown, SecretCard, UI kit
    src/lib/               # Session storage helpers
  api-server/              # Express 5 API server
    src/lib/rooms.ts       # In-memory room engine (expiry, presence, host auth)
    src/routes/rooms.ts    # Room endpoints + SSE event stream
lib/
  api-spec/openapi.yaml    # Source-of-truth API contract
  api-client-react/        # Generated React Query hooks + types
  api-zod/                 # Generated Zod validation schemas
```

### Real-time event stream

The client opens a native `EventSource` to `/api/rooms/:code/events?participantId=...`, which emits two named events:

| Event | Payload | Meaning |
|-------|---------|---------|
| `state` | full `Room` object | Current state on connect and after every change (secret added/edited/deleted, participant joined/left) |
| `expired` | `{ code, reason }` | The room was destroyed (`reason` is `timer` or `host-ended`) |

## Local setup

Requires **Node.js 24** and **pnpm**.

```bash
# 1. Install dependencies
pnpm install

# 2. Run the app (two terminals)
#    API server:
pnpm --filter @workspace/api-server run dev
#    Web app:
pnpm --filter @workspace/secret-share run dev
```

No environment variables or database are required.

## Running the application

- **Development:** start the two commands above, then open the web app's preview URL.
- **Typecheck:** `pnpm run typecheck`
- **Build everything:** `pnpm run build`
- **Regenerate API code:** `pnpm --filter @workspace/api-spec run codegen`

## Deployment

The app is deployed on Replit. The web artifact is served as a static site and the API server runs as a Node service; Replit's path-based routing sends `/api` requests to the API server and everything else to the SPA.

Live URL: **<!-- LIVE_URL_ANCHOR -->_published_here_<!-- /LIVE_URL_ANCHOR -->**

## Limitations

- **In-memory state.** Rooms live only in the API server's memory. Restarting the server, redeploying, or scaling to multiple instances destroys active rooms. Rooms do not survive a server restart.
- **Single region / single instance.** Because presence and rooms are per-process, the app should run on one instance.
- **Six-digit codes.** Rooms are protected only by a six-digit code, so this is suited to trusted groups (workshops, cohorts) rather than as a hardened secrets vault.
- **No cross-device sync.** Sessions are per-browser; there are no accounts.

## Future improvements

- Short-lived shared store (e.g. Redis-style) so rooms survive a server restart or horizontal scaling while still self-destructing.
- Rate-limiting / throttling join attempts to make the six-digit codes more resilient to brute-force guessing.
- Automated tests for the room engine's expiry, presence, and host-auth behavior using fake timers.
- Optional per-secret burn-on-first-read (secrets that reveal once and then disappear).

## License

[MIT](./LICENSE)
