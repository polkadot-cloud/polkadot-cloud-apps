// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useBalances } from 'hooks/useBalances'
import { useStaking } from 'hooks/useStaking'
import { Editor } from 'library/ManageNominations/Editor'
import { Page } from 'ui-core/base'

const Inner = () => {
	const { activeAddress } = useActiveAccount()
	const { isBonding } = useStaking()

	return (
		<>
			<Page.Title title="Nominate" />
			<Page.Row>
				<Editor
					bondFor="nominator"
					canSubmit={Boolean(activeAddress) && isBonding}
					dappName={NominateDappName}
					displayFor="default"
					optimalSelectionOnly
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
	const nominated = formatWithPrefs(getNominations(activeAddress))
	const nominationsKey = nominated.map(({ address }) => address).join(':')

	return (
		<ManageNominationsProvider
			key={`${activeAddress || 'disconnected'}:${nominationsKey}`}
			nominations={nominated}
			initialMethod="Optimal Selection"
			provideNominationHealth={false}
		>
			<Inner />
		</ManageNominationsProvider>
	)
}
