# Changelog

## [1.6.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.5.0...types-v1.6.0) (2026-07-24)


### Features

* Add stablecoin service layer ([#3697](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3697)) ([e931ab6](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/e931ab691680692b2331cd90a083235cbf5d86a6))
* **fix:** derive effective unbond duration from chain state for unbonding displays ([#3624](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3624)) ([089a9c5](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/089a9c56d4c32656af788b488e5a26026b83234a))
* Prepare shared stablecoin support ([#3696](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3696)) ([5f8605f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5f8605f2e90cdaed82a5d03a1dae03fabba66c9d))
* **refactor:** Add `network` to transaction UIDs ([#3690](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3690)) ([4b1f8e5](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/4b1f8e54b5f2a54d3bee10ecea2b14b5b6dba2f8))
* **refactor:** init `app-staking` ([#3614](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3614)) ([b2bc71e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b2bc71e96eae2a99f15e815654c3dba88da6a830))
* **refactor:** Move Tx library components to `ui-app` ([#3622](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3622)) ([c63a3b3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c63a3b334712902979e778b85f9c870edeeffe2d))
* **refactor:** Move worker to standalone package ([#3563](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3563)) ([ff533dd](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ff533dd9feb198bec105e2c0719d69d76bd46364))
* **refactor:** revise Tx  ([#3688](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3688)) ([35ff02a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/35ff02a288b1853deb0cb167a3654328be942db6))
* **refactor:** Support custom transaction fee display ([#3651](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3651)) ([5b78d47](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5b78d473f871c7ddb79868eb7ab85b34ef9bd784))
* **refactor:** Update `ui-app` transaction submission ([#3692](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3692)) ([effbb51](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/effbb51721b4c92583814f476618225dd2d72261))
* Remove deprecated validator commission UI ([#3640](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3640)) ([2586616](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2586616543521052215bdab495ea601319cad135))

## [1.5.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.4.0...types-v1.5.0) (2026-05-26)


### Features

* Add Paseo testnet support ([#3237](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3237)) ([6f8254b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6f8254b514fba0cd582c33bb33615640b4407170))
* Enhanced rewards list pagination ([#3497](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3497)) ([31a3c32](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/31a3c32d04921d75143a65ebad302586ba939ed1))
* Ledger Flex & Stax device support ([#3248](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3248)) ([75918a9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/75918a938a4711b95bc442a1271899257d624c07))
* **refactor:** Abstract proxy account support ([#3449](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3449)) ([abef2fb](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/abef2fbc238ed41682e29bd96bfa30fdade56bdc))
* **refactor:** Async pool role identity fetch ([#3199](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3199)) ([a892941](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/a892941c665943846a55dad0c405beeb445d4554))
* **refactor:** Stop connecting to relay api on app bootstrap ([#3198](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3198)) ([3d6a52b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/3d6a52b5108242d3dda788fd7f483f1e05daff8b))
* **ux:** Overview revisions ([#3217](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3217)) ([6aa82ef](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6aa82ef8f0f329ce416f0deb8dbcba3490e68038))

## [1.4.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.3.0...types-v1.4.0) (2026-01-12)


### Features

* Add `AccountDropdown` component ([#3075](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3075)) ([0e350aa](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0e350aa3fb3964c8afe26ec320e1ed7a5887912c))
* Display pool member claim permission in member list ([#3151](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3151)) ([c14cd91](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c14cd91c10ccb46e97d250c0fe4959a9e7a071bc))
* Introduce validator APY to validator and nominator lists ([#3109](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3109)) ([7fbccc3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7fbccc30d4f2bfae5b84aeb609e16d1f82e50c96))
* Move pools list to advanced `pools` category ([#3124](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3124)) ([781c8c1](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/781c8c176d9ddca51bbea73a230baf8ef3e26f02))
* **refactor:** Kusama asset hub migration ([#3025](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3025)) ([da04a75](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/da04a75b3c4745a9849fa09983657dbda7e4a82e))
* **refactor:** linting with `@biomejs/biome` ([#2933](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2933)) ([b95da17](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b95da17d4fa0d60cfdc3cd44a0de537cae461bf5))
* **refactor:** Remove fast unstake support  ([#3135](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3135)) ([1b17230](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1b17230a5cb691219aef94a04280f5b9a6d98463))
* Replace subscan pool member query with staking api ([#3149](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3149)) ([0a3d8f9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/0a3d8f92555073982aef3d64860eae124b12aae7))
* Support multiple Dedot providers for automatic RPC failover ([#3113](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3113)) ([7063c2a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7063c2a2f5e7106ec2bdf31e553c33f25b13d8a1))
* **ux:** Header and side menu revisions, new advanced mode menu design ([#2962](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2962)) ([41611be](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/41611be616300cbaa93bf6da1adf9e4a096fe97f))

## [1.3.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.2.0...types-v1.3.0) (2025-06-17)


### Features

* Add `rpc-config` package with scheduled updates ([#2706](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2706)) ([a27b300](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/a27b30049d0db72ec23a057dd2686585fa1045f3))
* Add AssetHub chains to `dedot-api` default services ([#2701](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2701)) ([6e1ba02](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6e1ba02edb8689c609a9b3af35820f081ce67be0))
* Controller migration prompt ([#2780](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2780)) ([1d29aa7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1d29aa7a11f1f87aaf4290cdb7c52a3f3ea59ae2))
* Init `global-bus`, refactor assets, consts, network data. Network to global bus ([#2640](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2640)) ([00d7ca4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/00d7ca4d765777ca59ce055484c23fc138bdb935))
* Init Dedot API support, expand `global-bus`, `dedot-api` packages, remove Polkadot API ([#2656](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2656)) ([024eff3](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/024eff3a8c006ed842af42b9d86f97f1e7481da2))
* Migrate Westend api to asset hub ([#2749](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2749)) ([e48a1cd](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/e48a1cdb9ff5b6c62d06feeabccb3f82185b9f8c))
* Pool and Nominator Setups Revision, One-Click Setup ([#2729](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2729)) ([92750f0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/92750f08c99626fbcc19dbf58aad4c6656588ec0))
* Quick actions component for overview page ([#2728](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2728)) ([ce60b2f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ce60b2f8800d19287647d388bb47f3a98eecabc3))
* **refactor:** `[@w3ux](https://github.com/w3ux) bumps`, types updates ([#2619](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2619)) ([08a0027](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/08a0027f941cf2505311c381855e7994aef582ff))
* **refactor:** Abstract balance functions, add unit tests, `useAccountBalances` hook ([#2819](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2819)) ([78160d7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/78160d740ec2a6d53136a7ea05938b3b0b927639))
* **refactor:** Global bus external accounts, use `activeAddress` ([#2642](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2642)) ([f2e0842](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/f2e084261201dfe67ac8ca613940f8e1b7fd1bd9))
* **refactor:** Migrate from yarn to pnpm ([#2628](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2628)) ([7efe25e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7efe25e7e98895ad89a69c3e55a2688e088f82a5))
* **refactor:** Move active proxy logic to `global-bus`, `dedot-api` ([#2786](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2786)) ([40a6bdb](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/40a6bdbfb623d6ad4d17f4ca9457f9c39f0b35ed))
* **refactor:** Move syncing to `global-bus` and `dedot-api` ([#2741](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2741)) ([c8f4531](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c8f45316ffd68f55cd2930097ae145f85a535737))
* **refactor:** Notifications to global bus ([#2797](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2797)) ([6a833ca](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6a833cae656451c269d6f293dcfaf4238aa19f58))
* **refactor:** Optimise tsconfigs ([#2781](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2781)) ([00245a0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/00245a01717d82f7b0e33c384a7e9cf2fb5a728f))
* support unmigrated controller accounts in `dedot-api` ([#2779](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2779)) ([9c36a4e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/9c36a4edbe0ecd28502812e6b8e90f6b2618e354))
* Use `dedot/merkleized-metadata`, misc tidy-ups ([#2721](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2721)) ([51d1cee](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/51d1cee9cd3e9020edd201a42ba83e5c33558d2e))
* **ux:** Add canvas max width support ([#2609](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2609)) ([077ba6b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/077ba6b790acbc2a4becdae5f9a6867b3a3c7877))
* **ux:** Manage Nominations Full Screen UI, Remove confirm dialogue ([#2613](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2613)) ([7afb86f](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7afb86fc9ebeed9ddd580a01179ebb1ef6f90320))
* **ux:** Simplified header UI, new Account, Settings popovers ([#2573](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2573)) ([d384b83](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/d384b83409e6941187da2fd910a96b803644fcdc))
* Various fixes for solo chain support ([#2778](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2778)) ([d27fc66](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/d27fc66b09ab4d5bd6edd875ec4f1db9fd195ccc))

## [1.2.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.1.0...types-v1.2.0) (2025-02-24)


### Features

* Validator performance charts from Staking API ([#2466](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2466)) ([6215f47](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6215f4731505e95bf78ffe826f57918b99e7a6a5))
* Validator ranks from Staking API, stop historical era point scraping ([#2480](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2480)) ([abe0b1c](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/abe0b1c097dc89b60fd2c540fe84f66f69a2b6c4))

## [1.1.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/types-v1.0.0...types-v1.1.0) (2025-01-16)


### Features

* **fix:** Remove left pool from state ([#2373](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2373)) ([4b823b9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/4b823b9108b7502f0a40ed4c08da3197dd4f343c))
* **refactor:** Pool rewards to controller, pool types to `types` package ([#2344](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2344)) ([437ffe4](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/437ffe4cca9ac23fe412cec68f59ee095f1e195f))
* **refactor:** Remove semi ([#2356](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/2356)) ([4c10b19](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/4c10b192612f557128b3eb23af68a24a993f41e7))
