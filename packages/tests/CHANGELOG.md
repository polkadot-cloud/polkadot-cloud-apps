# Changelog

## [1.2.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/tests-v1.1.0...tests-v1.2.0) (2026-09-12)


### Features

* Add detailed validator list items on Kusama ([#3815](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3815)) ([1c01a96](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1c01a968635eafdb5cfd73651636a70ffa48d4e3))
* Add hetzner validator warning ([#3806](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3806)) ([ec31d61](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ec31d617c77c2508f2bf79e222f8dabcf64c4aa8))
* Add validator warnings and optimize nomination UI ([#3794](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3794)) ([582e733](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/582e733902b086f4e7a90d913e0dd0db5965b7d4))
* Bootstrap additional `data-gate` queries, era stakers data point ([#3811](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3811)) ([dd5bbf9](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/dd5bbf913350f5f806b038ae421cc00cc73c14be))
* **refactor:** Apply retainment schema updates ([#3792](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3792)) ([3105699](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/310569991497544d62f6e1ee27493b35b1ec0634))
* **refactor:** Init `data-gate` with nomination status use case ([#3810](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3810)) ([d9af5f0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/d9af5f028a881d4ba51bea811b4e551c8df5bd13))
* **refactor:** Move `ValidatorEntries` to `data-gate` ([#3816](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3816)) ([6c17103](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6c17103f724049017ade855b39577cf9a31814d9))
* **refactor:** Speed up validator status and total stake syncing ([#3808](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3808)) ([6ffed46](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6ffed46b0e198c9c25dab37042ff076417c6eac4))
* Retainment UI uses rolling 3 month figures in lists ([#3787](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3787)) ([8d5891a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/8d5891aea486ca6e65935c615587f9de2d4acebb))
* Support cloud rpc auth token ([#3817](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3817)) ([1590005](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/15900052faac815912e3a51fe3f79968b040bb16))
* **ux:** Add validator warning badges to row items ([#3809](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3809)) ([6283ab7](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6283ab7f1ab1bfa41c515ad415c3c3c9130ad91e))
* Validating accounts category, revise hook setup ([#3788](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3788)) ([1d611b0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1d611b0e41691e670a7523489a9c5df4efe853bd))

## [1.1.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/tests-v1.0.0...tests-v1.1.0) (2026-08-09)


### Features

* **refactor:** init `app-staking` ([#3614](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3614)) ([b2bc71e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b2bc71e96eae2a99f15e815654c3dba88da6a830))
* **refactor:** Rename stablecoins -&gt; swap app ([#3701](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3701)) ([8f2bf87](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/8f2bf87830d832a179d6cacff747d5b0892d51fb))
* Support DOT transfers in `SendForm` ([#3700](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3700)) ([27a71ea](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/27a71ea0ccbccc8f1b1be95a7bf6e88395da84c4))
* **ux:** Revise balance inputs, add `BalanceInputMulti` ([#3695](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3695)) ([cb62237](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/cb62237a18b0c93246c5843bc728dfa98aa940de))
* Validator Retainment UI - Phase 1 ([#3732](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3732)) ([dd6d864](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/dd6d86471113e0faaac021cc4ddc6e799f2fc23c))


### Bug Fixes

* **balances:** read back stored fee reserve and guard malformed localStorage ([#3564](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3564)) ([2f0e839](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2f0e8397b685402cf0acdd027f36fca8b6f09ba1))
* **utils:** treat unbonding chunks maturing in the current era as unlocked ([#3672](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3672)) ([5032827](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/50328272c70ae3643db6ba0543f1de79fd0c096c))
