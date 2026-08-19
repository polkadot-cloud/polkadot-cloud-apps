// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useActivePool } from 'hooks/useActivePool'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { Editor } from 'library/ManageNominations/Editor'
import { Page } from 'ui-core/base'

const Inner = ({
	bondFor,
	poolId,
}: {
	bondFor: 'nominator' | 'pool'
	poolId?: number
}) => {
	const { activeAddress } = useActiveAccount()
	const { isBonding } = useStaking()
	const isPool = bondFor === 'pool'

	return (
		<>
			<Page.Title title="Nominate" />
			<Page.Row>
				<Editor
					bondFor={bondFor}
					canSubmit={Boolean(activeAddress) && (isPool || isBonding)}
					dappName={NominateDappName}
					displayFor="default"
					optimalSelectionOnly
					poolId={poolId}
					standaloneCards
				/>
			</Page.Row>
		</>
	)
}

export const NominateStandalone = () => {
	const { activeAddress } = useActiveAccount()
	const { getNominations } = useBalances()
	const { formatWithPrefs } = useValidators()
	const { activePool, activePoolNominations, isOwner } = useActivePool()
	const isPool = Boolean(activePool) && isOwner()
	const nominated = formatWithPrefs(
		isPool
			? (activePoolNominations?.targets ?? [])
			: getNominations(activeAddress),
	)
	const nominationsKey = nominated.map(({ address }) => address).join(':')
	const bondFor = isPool ? 'pool' : 'nominator'

	return (
		<ManageNominationsProvider
			key={`${activeAddress || 'disconnected'}:${bondFor}:${activePool?.id || ''}:${nominationsKey}`}
			nominations={nominated}
			initialMethod="Optimal Selection"
			provideNominationHealth={false}
		>
			<Inner bondFor={bondFor} poolId={isPool ? activePool?.id : undefined} />
		</ManageNominationsProvider>
	)
}
