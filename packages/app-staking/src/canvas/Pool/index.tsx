// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffectIgnoreInitial } from '@w3ux/hooks'
import { getNetworkKnownPoolIds } from 'consts/util/pools'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useDataResource } from 'data-gate/react'
import { poolCandidates as poolCandidateResource } from 'data-gate/resources/pools'
import { poolRoleIdentities$ } from 'global-bus'
import { useInvites } from 'hooks/useInvites'
import { useNetwork } from 'hooks/useNetwork'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool, RoleIdentities } from 'types'
import { CardWrapper } from 'ui-app/Card'
import { Head, Main } from 'ui-core/canvas'
import { CloseCanvas, useOverlay } from 'ui-overlay'
import { Header } from './Header'
import { Nominations } from './Nominations'
import { Overview } from './Overview'
import { Preloader } from './Preloader'
import { InviteHeader } from './Wrappers'

export const Pool = () => {
	const { t } = useTranslation('app')
	const {
		config: { options },
	} = useOverlay().canvas
	const { network } = useNetwork()
	const { inviteConfig } = useInvites()
	const { poolsMetaData, bondedPools } = useBondedPools()

	// Store latest pool candidates

	// Get the provided pool id and performance batch key from options, if available
	const providedPool = options?.providedPool
	const providedPoolId = providedPool?.id || null
	const candidates = useDataResource(
		poolCandidateResource(import.meta.env.PROD, !providedPoolId),
	)
	const poolCandidates = candidates.data?.poolCandidates ?? []

	// Whether performance data is ready
	const performanceDataReady = !!providedPoolId || poolCandidates.length > 0

	// The active canvas tab.
	const [activeTab, setActiveTab] = useState<number>(0)

	// Store any identity data for pool roles from global-bus
	const [roleIdentities, setRoleIdentities] = useState<
		RoleIdentities | undefined
	>(undefined)

	const shuffledCandidates: BondedPool[] = useMemo(
		() =>
			poolCandidates
				.map((poolId) =>
					bondedPools.find(
						(bondedPool) => Number(bondedPool.id) === Number(poolId),
					),
				)
				.filter((entry) => entry !== undefined),
		[candidates.data, bondedPools],
	)

	const initialSelectedPoolId = useMemo(
		() =>
			providedPoolId ||
			shuffledCandidates[(shuffledCandidates.length * Math.random()) << 0]
				?.id ||
			0,
		[],
	)

	// The selected bonded pool id. Assigns a random id if one is not provided
	const [selectedPoolId, setSelectedPoolId] = useState<number>(
		initialSelectedPoolId,
	)

	// Sync selectedPoolId when the provided pool changes (e.g. deep link URL
	// updated while canvas is already open)
	useEffect(() => {
		if (providedPoolId && providedPoolId !== selectedPoolId) {
			setSelectedPoolId(providedPoolId)
		}
	}, [providedPoolId])

	// The bonded pool to display. Use the provided `poolId`, or assign a random eligible filtered
	// pool otherwise. Re-fetches when the selected pool count is incremented
	const bondedPool = useMemo(
		() => bondedPools.find(({ id }) => Number(id) === Number(selectedPoolId)),
		[selectedPoolId, bondedPools],
	)

	useEffect(() => {
		if (providedPoolId || !candidates.data) return
		const known = getNetworkKnownPoolIds(network)
		const preferred = candidates.data.poolCandidates.filter((id) =>
			known.includes(id),
		)
		const choices = preferred.length
			? preferred
			: candidates.data.poolCandidates
		setSelectedPoolId(choices[Math.floor(Math.random() * choices.length)] ?? 0)
	}, [providedPoolId, network, candidates.data])

	// Subscribe to pool role identities from global-bus
	useEffectIgnoreInitial(() => {
		const sub = poolRoleIdentities$.subscribe((allIdentities) => {
			if (selectedPoolId) {
				setRoleIdentities(allIdentities[selectedPoolId])
			}
		})
		return () => sub.unsubscribe()
	}, [selectedPoolId])

	return (
		<Main>
			{(!providedPoolId && !performanceDataReady) || !bondedPool ? (
				<Preloader />
			) : (
				<>
					<Head>
						<CloseCanvas />
					</Head>
					{inviteConfig && inviteConfig.type === 'pool' && (
						<CardWrapper className="canvas">
							<InviteHeader>
								<h2>{t('poolInviteTitle')}</h2>
								<h4>{t('poolInviteSubtitle')}</h4>
							</InviteHeader>
						</CardWrapper>
					)}
					<Header
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						bondedPool={bondedPool}
						metadata={poolsMetaData[selectedPoolId]}
						autoSelected={!providedPoolId}
					/>
					{activeTab === 0 && (
						<Overview
							bondedPool={bondedPool}
							roleIdentities={roleIdentities}
							setSelectedPoolId={setSelectedPoolId}
							poolCandidates={shuffledCandidates}
							providedPoolId={providedPoolId}
						/>
					)}
					{activeTab === 1 && (
						<Nominations
							poolId={bondedPool.id}
							stash={bondedPool.addresses.stash}
						/>
					)}
				</>
			)}
		</Main>
	)
}
