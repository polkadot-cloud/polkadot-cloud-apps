// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Staking
export const StakingDappName = 'Polkadot Cloud Staking'
export const StakingProductionURL = 'https://staking.polkadot.cloud'
export const PlatformDocsURL = 'https://docs.staking.polkadot.cloud'

// Platform
export const PlatformName = 'Polkadot Cloud'
export const PlatformURL = 'https://polkadot.cloud'
export const PlatformPrivacyURL = 'https://polkadot.cloud/privacy'
export const PlatformDisclaimerURL = 'https://polkadot.cloud/disclaimer'
export const PlatformSupportEmail = 'support@polkadot.cloud'
export const PlatformGitHubURL =
	'https://github.com/polkadot-cloud/polkadot-cloud-apps'
export const DiscordSupportURL = 'https://discord.gg/QY7CSSJm3D'
export const AssetHubPolkadotSubscanURL = 'https://assethub-polkadot.subscan.io'
export const ManualSigners = ['ledger', 'vault', 'wallet_connect']

// Analytics
export const SAEnabled = false

// Element Thresholds
export const SideMenuHiddenWidth = 250
export const SideMenuMaximisedWidth = 145
export const SideMenuMinimisedWidth = 75
export const SectionFullWidthThreshold = 1000
export const PageWidthMediumThreshold = 1150
export const PageWidthLargeThreshold = 1400
export const SmallFontSizeMaxWidth = 600

// Misc Values
export const MaxNominations = 16
export const MaxPayoutDays = 60
export const PoolSharesDays = 21
export const MaxEraRewardPointsEras = 10
export const PerbillMultiplier = 10000000
export const ToastDelayDuration = 3000
export const MaximumPayoutDays = 60
export const SyncTimeoutDuration = 10000

// Local storage keys
export const FiatCurrencyKey = 'currency'
export const NetworkKey = 'network'
export const ExternalAccountsKey = 'external_accounts'
export const ProviderTypeKey = 'providerType'
export const AutoRpcKey = 'autoRpc'
export const PoolSetupsKey = 'poolSetups'
export const NominatorSetupsKey = 'nominatorSetups'
export const AdvancedModeKey = 'advancedMode'
export const ShowHelpKey = 'showHelp'
export const ActiveProxiesKey = 'activeProxies'
export const ActivePagesKey = 'activePages'

export const rpcEndpointKey = (network: string) => `${network}RpcEndpoints`
export const rpcHealthCacheKey = (network: string) => `${network}RpcHealth`
export const ledgerDeviceGroupsKey = (network: string) =>
	`${network}LedgerDeviceGroups`
