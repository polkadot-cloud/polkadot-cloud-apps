# Changelog

## [0.2.0](https://github.com/polkadot-cloud/polkadot-cloud-apps/compare/hooks-v0.1.0...hooks-v0.2.0) (2026-08-09)


### Features

* add `app-stablecoins` skeleton [2] ([#3687](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3687)) ([5b7868b](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/5b7868b64a4fa7c2d03166d259848349cc82976c))
* Add `useDefaultCategories` hook ([#3650](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3650)) ([7c15d83](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7c15d83afc877818f597ec49d735708cea0e674b))
* Add stablecoin service layer ([#3697](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3697)) ([e931ab6](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/e931ab691680692b2331cd90a083235cbf5d86a6))
* **fix:** derive effective unbond duration from chain state for unbonding displays ([#3624](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3624)) ([089a9c5](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/089a9c56d4c32656af788b488e5a26026b83234a))
* **locales:** add Russian (ru) language support ([#3594](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3594)) ([299b4ca](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/299b4cab28f24ca9636e85fb4bc167b065587d54))
* **refactor:** `ActiveStaker`, `UI`, `PoolMembers` contexts to standalone hooks  ([#3557](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3557)) ([7f35f18](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7f35f182dd1a96372598907afb2f5c129b30c129))
* **refactor:** `Invites`, `FavoritePools`, `PoolSetups` contexts to standalone hooks  ([#3552](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3552)) ([32acbc0](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/32acbc043c2d6a09893045c11e80461a6da47b82))
* **refactor:** `Operators`, `Help`, `Tooltip` contexts to standalone hooks  ([#3556](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3556)) ([381eee8](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/381eee8222b7967138f7e22c18461165848b314e))
* **refactor:** `Staking`, `Payouts`, `FavoriteValidators` contexts to standalone hooks  ([#3554](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3554)) ([386a5be](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/386a5bee9aa3da1e10871f3f39d56eb1efb0d778))
* **refactor:** Abstract key library and context components ([#3617](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3617)) ([6fee099](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/6fee099114c1bdcd5a7887d7e14b5f8125bf7d3c))
* **refactor:** init `app-staking` ([#3614](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3614)) ([b2bc71e](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/b2bc71e96eae2a99f15e815654c3dba88da6a830))
* **refactor:** Init `ui-modals`, mv `Accounts` modal ([#3616](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3616)) ([ed170be](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ed170be36e996fcabe57f0cdc410db5abf79e186))
* **refactor:** Move `usePageFromHash` hook ([#3655](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3655)) ([1e6a6e6](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/1e6a6e6d8a688516c09a5cb5ae49fd7984636d92))
* **refactor:** Move `useTheme` to `hooks` ([#3619](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3619)) ([8a4f72a](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/8a4f72aef00df6af7b4535617c6a61bfd4652e77))
* **refactor:** Move hooks batch from `app` to `hooks` package ([#3558](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3558)) ([7f592ae](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/7f592aedec8d030cbc767716a3c51159cfdfcdb2))
* **refactor:** Move ThemeValues to `hooks` ([#3620](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3620)) ([e070e76](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/e070e76b141d80e1b4524b87d5eca7a98a1214cb))
* **refactor:** Move worker to standalone package ([#3563](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3563)) ([ff533dd](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/ff533dd9feb198bec105e2c0719d69d76bd46364))
* **refactor:** Sunset Westend support ([#3733](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3733)) ([830362c](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/830362cacf610858d27a8d8f3e3dd3161345a37b))
* Use direct nomination status query ([#3718](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3718)) ([c6ab077](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/c6ab0771238896c1d40bd7e30bcdc45da66101e4))
* **ux:** add useFitText hook to fit side menu labels on one line ([#3717](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3717)) ([aecd4ec](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/aecd4ec94b81d7607a116fc7a4421c3b4a43f996))
* **ux:** Revise balance inputs, add `BalanceInputMulti` ([#3695](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3695)) ([cb62237](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/cb62237a18b0c93246c5843bc728dfa98aa940de))
* Validator Retainment UI - Phase 1 ([#3732](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3732)) ([dd6d864](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/dd6d86471113e0faaac021cc4ddc6e799f2fc23c))


### Bug Fixes

* **balances:** read back stored fee reserve and guard malformed localStorage ([#3564](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3564)) ([2f0e839](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/2f0e8397b685402cf0acdd027f36fca8b6f09ba1))


### Performance Improvements

* **api:** extract useStakingMetrics to stop per-block re-render cascade ([#3568](https://github.com/polkadot-cloud/polkadot-cloud-apps/issues/3568)) ([8c084aa](https://github.com/polkadot-cloud/polkadot-cloud-apps/commit/8c084aada2000e1ba07fb99057edd1da8b27e151))
