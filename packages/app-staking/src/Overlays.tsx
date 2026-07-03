// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ErrorFallbackModal } from 'library/ErrorBoundary'
import { type ComponentType, lazy } from 'react'
import { Overlay } from 'ui-overlay'

type OverlayLoader<TModule = Record<string, unknown>> = () => Promise<TModule>

const lazyNamed = <TModule extends Record<string, unknown>>(
	load: OverlayLoader<TModule>,
	exportName: string,
) =>
	lazy(async () => {
		const module = await load()
		const component = module[exportName]

		if (!component) {
			throw new Error(`Missing overlay export: ${exportName}`)
		}

		if (typeof component !== 'function') {
			throw new Error(
				`Export ${exportName} is not a component (expected function, got ${typeof component})`,
			)
		}

		return { default: component as ComponentType }
	})

const lazyOverlayComponents = <
	T extends Record<string, OverlayLoader<Record<string, unknown>>>,
>(
	loaders: T,
) =>
	Object.fromEntries(
		Object.entries(loaders).map(([key, load]) => [key, lazyNamed(load, key)]),
	) as Record<keyof T, ReturnType<typeof lazyNamed>>

const modals = lazyOverlayComponents({
	Accounts: () => import('modals/Accounts'),
	Bio: () => import('modals/Bio'),
	Bond: () => import('modals/Bond'),
	ChangePoolRoles: () => import('modals/ChangePoolRoles'),
	ClaimPayouts: () => import('modals/ClaimPayouts'),
	ClaimReward: () => import('modals/ClaimReward'),
	DiscordSupport: () => import('modals/DiscordSupport'),
	ExternalAccounts: () => import('modals/ExternalAccounts'),
	ImportAccounts: () => import('modals/ImportAccounts'),
	Invite: () => import('modals/Invite'),
	JoinPool: () => import('modals/JoinPool'),
	LeavePool: () => import('modals/LeavePool'),
	MailSupport: () => import('modals/MailSupport'),
	ManagePool: () => import('modals/ManagePool'),
	Networks: () => import('modals/Networks'),
	Plugins: () => import('modals/Plugins'),
	RewardCalculator: () => import('modals/RewardCalculator'),
	SelectCurrency: () => import('modals/SelectCurrency'),
	SelectLanguage: () => import('modals/SelectLanguage'),
	SetController: () => import('modals/SetController'),
	SimpleNominate: () => import('modals/SimpleNominate'),
	StakingOptions: () => import('modals/StakingOptions'),
	StopNominations: () => import('modals/StopNominations'),
	SyncAccounts: () => import('modals/SyncAccounts'),
	Transfer: () => import('modals/Transfer'),
	Unbond: () => import('modals/Unbond'),
	UnlockChunks: () => import('modals/UnlockChunks'),
	Unstake: () => import('modals/Unstake'),
	UpdatePayee: () => import('modals/UpdatePayee'),
	UpdateReserve: () => import('modals/UpdateReserve'),
})

const canvas = lazyOverlayComponents({
	CreatePool: () => import('canvas/CreatePool'),
	ManageNominations: () => import('canvas/ManageNominations'),
	NominatorSetup: () => import('canvas/NominatorSetup'),
	Pool: () => import('canvas/Pool'),
	PoolMembers: () => import('canvas/PoolMembers'),
	ValidatorMetrics: () => import('canvas/ValidatorMetrics'),
})

export const Overlays = () => {
	return (
		<Overlay
			fallback={ErrorFallbackModal}
			externalOverlayStatus="closed"
			modals={modals}
			canvas={canvas}
		/>
	)
}
