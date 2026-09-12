[![Polkadot - App](https://img.shields.io/badge/Polkadot-App-E6007A?logo=polkadot&logoColor=E6007A)](https://staking.polkadot.cloud) ![ci](https://github.com/polkadot-cloud/polkadot-cloud-apps/actions/workflows/ci.yml/badge.svg) [![License](https://img.shields.io/badge/License-GPL3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)

# Polkadot Cloud Apps

## Local RPC authentication

Add `CLOUD_RPC_AUTH_TOKEN=your_dev_bearer_token` to the repository root `.env` file,
then start or restart any app with its `pnpm dev:*` command. Store the token without
the `Bearer` prefix.

The shared Vite development proxy forwards the Polkadot Cloud Statemint and People
connections with `Authorization: Bearer <token>`. This is needed because browsers
cannot set WebSocket headers, including through Dedot's `headers` option. The token
stays on the development server and is not included in client code. Other RPC
providers connect directly. Without a token, Cloud endpoints are omitted from the
available RPC providers and defaults in development.

Production builds connect directly to the Cloud endpoints using the existing origin
access rules; the development proxy and token are not needed for deployment.

## Local staking API authentication

Add `CLOUD_STAKING_API_AUTH_TOKEN=your_dev_bearer_token` to the repository root
`.env` file, then start or restart your app with its `pnpm dev:*` command.
Store the token without the `Bearer` prefix. This token is separate from
`CLOUD_RPC_AUTH_TOKEN`.

Apollo calls `https://api.staking.polkadot.cloud` directly and adds
`Authorization: Bearer <token>` in development when the token is configured.
The token is visible in your local browser's code and network requests. Vite
exposes this setting only in the development server, excluding it from builds
and preview. The RPC token and other private environment variables stay on the
development server. Without an API token, Apollo sends no Authorization header.

The planned production access rules allow HTTPS origins on `polkadot.cloud` and
`*.polkadot.cloud`, valid bearer tokens, and the staking API droplet's source IP
`138.68.147.67`. Enforcement is deferred until existing mobile clients can retain
access. When enforcement is enabled, localhost CORS preflights must be allowed
without authentication, and the subsequent API requests must supply a valid token.
Origin checks restrict browser access; they do not authenticate non-browser
clients, which can supply their own Origin header.

## Staking Dashboard

- [**English:** Welcome to Polkadot Cloud Staking!](https://docs.staking.polkadot.cloud/en/developer-overview)
- [**Deutsch:** Willkommen bei Polkadot Cloud Staking!](https://docs.staking.polkadot.cloud/de/developer-overview)
- [**Español:** ¡Bienvenido a Polkadot Cloud Staking!](https://docs.staking.polkadot.cloud/es/developer-overview)
- [**Français:** Bienvenue sur Polkadot Cloud Staking !](https://docs.staking.polkadot.cloud/fr/developer-overview)
- [**中文:** 欢迎使用Polkadot Cloud质押平台](https://docs.staking.polkadot.cloud/zh/developer-overview)
- [**Português:** Bem-vindo ao Polkadot Cloud Staking!](https://docs.staking.polkadot.cloud/pt/developer-overview)
- [**한국어:** Polkadot Cloud 스테이킹에 오신 것을 환영합니다!](https://docs.staking.polkadot.cloud/ko/developer-overview)
- [**Türkçe:** Polkadot Cloud Staking'e hoş geldiniz!](https://docs.staking.polkadot.cloud/tr/developer-overview)
