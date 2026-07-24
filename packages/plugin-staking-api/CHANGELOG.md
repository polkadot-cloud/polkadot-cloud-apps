# Changelog

## [1.7.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.6.0...plugin-staking-api-v1.7.0) (2026-07-24)


### Features

* **fix:** Fix validator stats query ([#3667](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3667)) ([0f81b7d](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0f81b7da63f107ccad0073ef2c3fc3755a1608dc))
* **refactor:** init `app-staking` ([#3614](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3614)) ([b2bc71e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b2bc71e96eae2a99f15e815654c3dba88da6a830))
* **refactor:** Support production pool candidates ([#3639](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3639)) ([c5f5e17](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c5f5e177619a346e1cba86f959a57c76c61c1225))
* Remove deprecated validator commission UI ([#3640](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3640)) ([2586616](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2586616543521052215bdab495ea601319cad135))
* Use sanitize nominee candidates query ([#3641](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3641)) ([db7d720](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/db7d72028edd85b0caab73f7fae241b54361b04d))
* **ux:** Incoming payments UI for `RewardDestination::Account`. ([#3547](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3547)) ([2209a28](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2209a28acb57dc130cf739d54068bb86faac30ca))

## [1.6.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.5.0...plugin-staking-api-v1.6.0) (2026-05-26)


### Features

* Enhanced rewards list pagination ([#3497](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3497)) ([31a3c32](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/31a3c32d04921d75143a65ebad302586ba939ed1))
* Fetch validator identities from Staking API identity cache ([#3210](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3210)) ([77c9f87](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/77c9f87f050caac5ccc4c35e1ea31a4bfd4355c3))
* **fix:** Fix reward trend API ([#3250](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3250)) ([2540c35](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2540c35fb74851e6c70bd4cf6714e0be84fec70d))
* **refactor:** Add `era` arg to `getNomineesStatus` ([#3316](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3316)) ([d627ff9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/d627ff9eb8f0c4dc3cec63af98a8995e8ac99538))
* **refactor:** Unify pool warning queries ([#3232](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3232)) ([42c521d](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/42c521d8591974fd29a456baf12a47044dd73dce))
* **refactor:** Use generic Staking API functions ([#3485](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3485)) ([e7f438b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/e7f438bd70e9f0c1380c5333dd87ddf87f13cae2))
* **ui:** Add pool shares to PayoutBar graphs ([#3484](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3484)) ([1410f36](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1410f3605cee592b1bc779e5137cbe5f3c7f0f33))
* **ux:** Add pool commission change rate warning ([#3230](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3230)) ([554d676](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/554d676099e74d1010c9ecd46ef230317cdcd052))
* **ux:** Overview revisions ([#3217](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3217)) ([6aa82ef](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6aa82ef8f0f329ce416f0deb8dbcba3490e68038))

## [1.5.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.4.0...plugin-staking-api-v1.5.0) (2026-01-12)


### Features

* Fast nomination status syncing ([#2937](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2937)) ([a1ddb08](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/a1ddb08e4151961a917aa7c93942726b342e8a73))
* Introduce validator APY to validator and nominator lists ([#3109](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3109)) ([7fbccc3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7fbccc30d4f2bfae5b84aeb609e16d1f82e50c96))
* **refactor:** `@apollo/client` v3 - v4 migration ([#3171](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3171)) ([5237c99](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5237c998a45845a1c216f6fd3eb1907422cc2f51))
* **refactor:** linting with `@biomejs/biome` ([#2933](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2933)) ([b95da17](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b95da17d4fa0d60cfdc3cd44a0de537cae461bf5))
* **refactor:** Remove fast unstake support  ([#3135](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3135)) ([1b17230](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1b17230a5cb691219aef94a04280f5b9a6d98463))
* Replace subscan pool member query with staking api ([#3149](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3149)) ([0a3d8f9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0a3d8f92555073982aef3d64860eae124b12aae7))

## [1.4.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.3.0...plugin-staking-api-v1.4.0) (2025-07-24)


### Features

* **refactor:** Total Nominator Count optimisations ([#2897](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2897)) ([5a3ec27](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5a3ec2777b0e8470a8e410f3142518c0e7411fb2))
* Search for validators in Manage Nominations ([#2900](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2900)) ([7e925ea](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7e925ea4cfa9092f8765e27aff9e7d66f35bb85d))
* **ux:** Tiered, network-aware help resources with multi-language support ([#2748](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2748)) ([330142b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/330142bf9506be41857f311969ef45f017139f25))

## [1.3.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.2.0...plugin-staking-api-v1.3.0) (2025-06-17)


### Features

* Implement RPC health check on network connect ([#2822](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2822)) ([6891521](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/689152198ab00deb7a7e1a11866a83c048636f76))
* Init `global-bus`, refactor assets, consts, network data. Network to global bus ([#2640](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2640)) ([00d7ca4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/00d7ca4d765777ca59ce055484c23fc138bdb935))
* **locales:** Add multi-currency support for staking rewards & balances ([#2563](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2563)) ([c25e64f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c25e64f0b35beb555641a1a6f018b63bb3cf32db))
* **refactor:** Migrate from yarn to pnpm ([#2628](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2628)) ([7efe25e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7efe25e7e98895ad89a69c3e55a2688e088f82a5))
* **refactor:** Optimise tsconfigs ([#2781](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2781)) ([00245a0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/00245a01717d82f7b0e33c384a7e9cf2fb5a728f))
* **refactor:** Use `validatorStats` endpoint ([#2791](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2791)) ([7e1d8a6](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7e1d8a6adbab3d273bb02c50fd7579f0e709bfc8))

## [1.2.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.1.0...plugin-staking-api-v1.2.0) (2025-02-24)


### Features

* Enhance graphs, add validator rewards, pool reward history graphs ([#2462](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2462)) ([ccda2cb](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ccda2cbaeac8075e8a6650410538f9f0ae9885d5))
* Global token price provider ([#2495](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2495)) ([1839d8f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1839d8fda077ff06e9849c9632b9b8b59a0d5afe))
* implement rewards calculator and merge payout history ([#2482](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2482)) ([d463aa4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/d463aa4bb361e3cdfed435a12ad8713b9a9d04ec))
* Pool performance & join candidates from Staking API, fallbacks, UI enhancements ([#2457](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2457)) ([73f198c](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/73f198c7956bfbd1cbb47780bcfac8e10d15d689))
* **refactor:** Misc updates & renames ([#2461](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2461)) ([ea3d4c3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ea3d4c3e796e09bfff3da659f5816416129ff933))
* **refactor:** Staking API arg `chain` -&gt; `network` ([#2515](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2515)) ([ccb2a63](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ccb2a63549ea3decdd1336848e46f95391cedf82))
* Validator performance charts from Staking API ([#2466](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2466)) ([6215f47](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6215f4731505e95bf78ffe826f57918b99e7a6a5))
* Validator ranks from Staking API, stop historical era point scraping ([#2480](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2480)) ([abe0b1c](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/abe0b1c097dc89b60fd2c540fe84f66f69a2b6c4))

## [1.1.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/plugin-staking-api-v1.0.0...plugin-staking-api-v1.1.0) (2025-01-16)


### Features

* **fix:** Fix prettier organize imports, lint. ([#2340](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2340)) ([441caf7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/441caf7069b7d9a59116c05a88e82748e7b31388))
* Historical pool rewards to Staking API, replace Subscan ([#2376](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2376)) ([9233131](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/9233131dfc4cb2781f719b80c825adc4fbc6c94c))
* Init Staking API GraphQL Plugin, discontinue Binance Spot ([#2332](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2332)) ([297b1d4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/297b1d463a770fcd213d9e9083e85446ce6fa834))
* Nominator Rewards from Staking API, discontinue Subscan nominator rewards ([#2365](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2365)) ([5e36d3a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5e36d3ae97177b19fc4875a891958b70186b0781))
* **refactor:** Remove semi ([#2356](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2356)) ([4c10b19](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/4c10b192612f557128b3eb23af68a24a993f41e7))
* **refactor:** Use Staking API for validator era points ([#2417](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2417)) ([9e1b37f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/9e1b37f1f032173700ce8cfacb18460143070db0))
* Refetch token price if online status is true ([#2337](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2337)) ([c87a8f2](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c87a8f2d6cff43b72c817c170fa83ced6d2786b9))
* Use `useCanFastUnstake` query ([#2377](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2377)) ([0d99cbb](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0d99cbb7156c30a047b4db32187977c1bc7b42c4))
