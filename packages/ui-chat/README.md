# Guidance chat

`ui-chat` connects the Nominate app to staking-api's `service-messaging` using a
guest credential and short-lived conversation tokens. Only `app-nominate` mounts
`<Chat />`, at the right end of its header. Other apps do not show a chat launcher.

Reusable presentation lives in `ui-app/Chat`: `ChatPanel`, `ChatMessages`,
`ChatComposer`, `ChatNotice`, and `ChatWelcome`. It uses the same Radix, CSS Module
SCSS, typography, theme variables, and header button conventions as `ui-core`.
The dialog portals into `useTheme().themeElementRef`, traps keyboard focus,
closes with Escape, and returns focus to the launcher. On desktop it is a compact
floating panel; narrow or short viewports use a full-screen layout with safe-area
spacing. Surfaces, message bubbles, focus rings, and actions use the workspace's
greyscale theme. Success, warning, and danger accents communicate connection or
delivery status only. Panel, backdrop, and content transitions respect reduced
motion preferences. The composer grows with the draft up to a bounded height.

## Package structure

- `src/index.tsx` exposes `Chat` and its props; `src/Chat/` composes the panel,
  welcome state, messages, and composer using the shared `ui-app/Chat` primitives.
- `src/useChat/` owns the React subscription, drawer state, draft, and client
  lifecycle. The endpoint is fixed for a mounted chat; remount to change services.
- `src/client.ts` owns the guest conversation, socket lifecycle, token renewal,
  retries, and confirmation of pending sends.
- `src/api.ts` normalizes the service origin and handles authenticated REST
  requests, cancellation, timeouts, and HTTP errors.
- `src/history.ts` merges messages and walks reconnect history back to the last
  REST boundary. `src/storage.ts` validates and persists the guest identity.
- `src/types.ts`, `src/defaults.ts`, and `src/consts.ts` hold protocol types,
  initial state, and shared limits. Component and hook types live alongside them.

The package inherits the root Biome configuration, uses the shared React
TypeScript configuration, and keeps its behavior tests in `packages/tests`.

## Public client configuration

Cloud-apps is a static website. It does not share staking-api's `.env` file or
any private environment values. Nominate builds connect to the public URL
`https://apps-ws.polkadot.cloud` by default and need no frontend environment
configuration for that deployment. That host must serve a TLS certificate valid
for `apps-ws.polkadot.cloud`; `ERR_CERT_COMMON_NAME_INVALID` means the server's
certificate does not cover the requested hostname.

During `pnpm dev:nominate`, chat uses the app's own origin. Vite proxies
`/guest/session`, `/conversations/:id/messages`, and `/socket.io/` (both polling
and WebSocket upgrades) to `http://127.0.0.1:4013`. Start staking-api's local
messaging service first; no local nginx or TLS certificate is needed for this
route. The proxy is enabled only by the development server, not builds (including
`--mode development`) or preview. Local guest credentials are scoped to the app's
origin, so changing its hostname or port starts a separate local identity.

`VITE_MESSAGING_URL` is an optional **public build-time URL**, embedded in the
JavaScript served to every visitor. It overrides the defaults above, connecting
directly to the configured origin, for example a local nginx proxy. It is not a
credential and does not need to remain private.
It must be an HTTP(S) origin without a path, credentials, or query string. Use
HTTPS for deployed clients. Never put signing secrets in Vite variables.

```sh
VITE_MESSAGING_URL=http://127.0.0.1:8080 pnpm --filter app-nominate dev
```

Alternatively, put this public setting in `packages/app-nominate/.env.local` and
restart Vite. The repository root `.env` is not Nominate's Vite environment
directory. Leave the override unset to use the built-in local messaging proxy.

## Server configuration (staking-api only)

Before deploying the app, deploy staking-api's
`20260924120000_guidance_guest_conversations` migration and updated messaging
service/dashboard. The messaging service needs an existing `polkadot` network,
`MESSAGING_TOKEN_SECRET`, and nginx in front of its loopback upstream. Configure
the exact Nominate and dashboard browser origins in nginx's
`messaging_origin_allowed` map, including local ports in development. Nginx owns
CORS, preflight responses, and origin checks for REST and WebSocket upgrades.
The dashboard **Node server inside staking-api** shares the signing secret
with service-messaging and uses `MESSAGING_PUBLIC_URL` for the same nginx origin.
These are two backend processes, not the static cloud-apps site or the dashboard
browser. Neither browser receives the signing secret. Both REST routes and `/socket.io/` must reach that proxy.
The explicit URL override above assumes local nginx listens on port 8080 and proxies
to the service on port 4013. Direct cross-origin browser requests to port 4013
are not supported without a proxy. Nominate's default development setup uses
Vite as that proxy; the deployed app and direct URL overrides use nginx.
No signing secret belongs in this app's environment.

## Lifecycle

Opening the panel does not create an empty conversation. Clicking **Start chat**
saves a random 256-bit guest key before calling `POST /guest/session` with `{}`
and the key in the Authorization bearer header. Repeating the exchange resumes
the same conversation. Existing browser credentials resume on opening the panel.
The service signs and returns a token scoped to that one guest conversation.
This is a runtime per-user credential, not a deployment secret bundled into the
website. The access JWT stays in memory and the connection renews it before
expiry. No cloud-apps backend or wallet authentication is required.

The credential lasts 30 days from creation. It is stored in local storage under
a key scoped to the messaging origin; clearing that storage loses access. If
storage is unavailable, the panel explains that only the current page retains
the conversation. Expiry prompts the user to start a new chat. Connecting or
switching wallets has no effect on the guest identity.

Socket acknowledgements confirm message persistence. An uncertain send keeps
its body and request UUID, also across reloads; **Retry message** reuses them.
Incoming events and REST history merge by ID. Reconnect follows pagination to
the prior REST boundary so messages arriving during an outage are recovered.
Older history is available through **Load earlier messages**. Closing the panel
keeps an initiated chat connected; unmounting closes the socket and cancels work.
**Live conversation** describes the connection, not staff availability.

English copy is in `locales/src/resources/en/chat.json`, registered in the staking
locale profile. `locales/src/resourceConfig.json` declares `chat` as English-only;
the locale loader and validator use this exception while retaining the usual
file and key checks for translated namespaces.

Chat is available only when the active language is `en` and the `staking_api`
plugin is enabled. Changing either condition unmounts the conversation, closing
its socket and cancelling pending requests. The saved guest credential remains
available when chat is enabled again.

## Verification

```sh
pnpm --filter tests test src/guestChat.test.ts
pnpm --filter tests test src/chatAvailability.test.ts src/localeResources.test.ts src/localeValidation.test.ts
pnpm --filter tests test src/messagingProxy.test.ts
pnpm --filter locales validate
pnpm --filter ui-chat check
pnpm exec tsc -p packages/ui-chat/tsconfig.json
pnpm exec biome check packages/ui-app/src/Chat packages/tests/src/guestChat.test.ts
pnpm exec stylelint packages/ui-app/src/Chat/index.module.scss
pnpm --filter app-nominate build:verify
```

The focused tests cover chat availability, English-only locale loading and
validation, resume, uncertain sends, persisted-event confirmation, reconnect
gaps, renewal, expiry, storage restrictions, cancellation, and stale responses
during reconnection. The
proxy tests verify REST credentials and bodies, polling, WebSocket upgrades, route
boundaries, and exclusion from builds and preview. The sibling
staking-api messaging tests exercise actual PostgreSQL, guest isolation,
concurrent creation, rate limits, and live dashboard replies. Nginx owns the
browser-origin checks.
