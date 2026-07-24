# Changelog

## [1.5.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.4.0...utils-v1.5.0) (2026-07-24)


### Features

* **refactor:** init `app-staking` ([#3614](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3614)) ([b2bc71e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b2bc71e96eae2a99f15e815654c3dba88da6a830))
* **refactor:** Page config utils to `utils` package ([#3559](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3559)) ([639b747](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/639b747d97a2f8b4cd75dccca253e8f68b02f40c))
* **ux:** Revise balance inputs, add `BalanceInputMulti` ([#3695](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3695)) ([cb62237](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/cb62237a18b0c93246c5843bc728dfa98aa940de))


### Bug Fixes

* **balances:** read back stored fee reserve and guard malformed localStorage ([#3564](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3564)) ([2f0e839](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2f0e8397b685402cf0acdd027f36fca8b6f09ba1))
* hooks, utils config ([#3546](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3546)) ([f31076b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/f31076bed2101b6d0d56811f92a2b26e71e6d436))

## [1.4.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.3.0...utils-v1.4.0) (2026-05-26)


### Features

* Fetch validator identities from Staking API identity cache ([#3210](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3210)) ([77c9f87](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/77c9f87f050caac5ccc4c35e1ea31a4bfd4355c3))
* **refactor:** Bump deps, dedot as peer, refresh pnpm.lock ([#3261](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3261)) ([75d783e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/75d783ee6a9d0e971aa2b88154d31d8476a89f6e))
* **refactor:** Pool commission management UX redesign ([#3435](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3435)) ([50ce159](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/50ce159117ce8c04ea0be96fb4875409ce997829))
* **ux:** Overview revisions ([#3217](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3217)) ([6aa82ef](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6aa82ef8f0f329ce416f0deb8dbcba3490e68038))
* **ux:** Transaction submission UI redesign ([#3291](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3291)) ([36dbad7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/36dbad704ad2a23a6db428e392a94cabfcc9764f))


### Bug Fixes

* correct typos ([#3314](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3314)) ([ab48baa](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ab48baa3e8051da02f509ff54267ca6ff03665a3))


### Performance Improvements

* **utils:** remove redundant null fallback in duration helper ([#3320](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3320)) ([f770db6](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/f770db6cfc41bd7bc7e4aa8ad61a79e30a702abd))

## [1.3.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.2.1...utils-v1.3.0) (2026-01-12)


### Features

* Fast nomination status syncing ([#2937](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2937)) ([a1ddb08](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/a1ddb08e4151961a917aa7c93942726b342e8a73))
* Introduce validator APY to validator and nominator lists ([#3109](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3109)) ([7fbccc3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7fbccc30d4f2bfae5b84aeb609e16d1f82e50c96))
* nav section from url & hook ([1ed6860](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1ed6860ccbc0445fde9116817a58a9d5667bba51))
* **refactor:** linting with `@biomejs/biome` ([#2933](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2933)) ([b95da17](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b95da17d4fa0d60cfdc3cd44a0de537cae461bf5))
* **ux:** Help tooltip, resources to docs ([#3087](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3087)) ([0a66b31](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0a66b31427fc50e9a8eed4f1d3414ed4b6eab4ec))

## [1.2.1](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.2.0...utils-v1.2.1) (2025-07-24)


### Bug Fixes

* Balance fixes ([#2892](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2892)) ([fc0fbfe](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/fc0fbfe5f6340de484423b3bea7e8f08624adfb9))

## [1.2.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.1.0...utils-v1.2.0) (2025-06-17)


### Features

* Init Dedot API support, expand `global-bus`, `dedot-api` packages, remove Polkadot API ([#2656](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2656)) ([024eff3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/024eff3a8c006ed842af42b9d86f97f1e7481da2))
* **refactor:** Abstract balance functions, add unit tests, `useAccountBalances` hook ([#2819](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2819)) ([78160d7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/78160d740ec2a6d53136a7ea05938b3b0b927639))
* **refactor:** Draw down modal wrappers ([#2816](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2816)) ([501928a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/501928a85ca155c0c1ababe8435c93ec064aa57e))
* **refactor:** Migrate from yarn to pnpm ([#2628](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2628)) ([7efe25e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7efe25e7e98895ad89a69c3e55a2688e088f82a5))
* **refactor:** misc fixes and bumps ([#2792](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2792)) ([a312dd1](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/a312dd18510d745550d26c3afdad34fc805fa6e8))
* **refactor:** Optimise tsconfigs ([#2781](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2781)) ([00245a0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/00245a01717d82f7b0e33c384a7e9cf2fb5a728f))
* **refactor:** Pass `BigInt` directly into `BigNumber`s  ([#2644](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2644)) ([0eaf59d](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0eaf59d77237ef943c8a49c6babf6c1a1db4cb37))
* **refactor:** Upgrade to `tsup` builds of `[@w3ux](https://github.com/w3ux)` library ([#2821](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2821)) ([cb39a10](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/cb39a106f21d18fd2f8d7a1d09c71d205be24963))
* Use `dedot/merkleized-metadata`, misc tidy-ups ([#2721](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2721)) ([51d1cee](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/51d1cee9cd3e9020edd201a42ba83e5c33558d2e))

## [1.1.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/utils-v1.0.0...utils-v1.1.0) (2025-02-24)


### Features

* **refactor:** Flatten locale files, combine base & library into app ([#2543](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2543)) ([db77b58](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/db77b58f77871e5d53175bb1a750dc41d0dffa76))
* **refactor:** Pool rewards to controller, pool types to `types` package ([#2344](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2344)) ([437ffe4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/437ffe4cca9ac23fe412cec68f59ee095f1e195f))
* **refactor:** Remove semi ([#2356](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2356)) ([4c10b19](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/4c10b192612f557128b3eb23af68a24a993f41e7))
