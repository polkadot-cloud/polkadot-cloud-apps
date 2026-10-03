// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { NominateDappName } from 'consts'
import { ManageNominationsProvider } from 'contexts/ManageNominations'
import { useValidators as useValidatorEntries } from 'contexts/Validators/ValidatorEntries'
import { useBalances } from 'hooks/useBalances'
import { SelectionActionTarget } from 'library/GenerateNominations/Wrappers'
import { Editor } from 'library/ManageNominations/Editor'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Page } from 'ui-core/base'
import { useStandaloneAccount } from './useStandaloneAccount'

export const NominateStandalone = () => {
	const { t } = useTranslation('app')
	const { getNominations } = useBalances()
	const {
		activeAddress,
		activePool,
		activePoolNominations,
		isPool,
		accountIsValidator,
		canManageNominations,
		eligibilityLoading,
	} = useStandaloneAccount()
	const [selectionActionTarget, setSelectionActionTarget] =
		useState<HTMLDivElement | null>(null)

	const nominationTargets = isPool
		? (activePoolNominations?.targets ?? [])
		: getNominations(activeAddress)
	const { formatWithPrefs } = useValidatorEntries(nominationTargets)
	const nominated = formatWithPrefs(nominationTargets)

	const nominationsKey = nominated.map(({ address }) => address).join(':')
	const bondFor = isPool ? 'pool' : 'nominator'
	const poolId = isPool ? activePool?.id : undefined

	return (
		<>
			<Page.Title
				standalone
				title={t('nominate')}
				titleActions={<SelectionActionTarget ref={setSelectionActionTarget} />}
			/>
			<Page.Row>
				<ManageNominationsProvider
					key={`${activeAddress || 'disconnected'}:${bondFor}:${activePool?.id || ''}:${nominationsKey}`}
					nominations={nominated}
					initialMethod="Optimal Selection"
					provideNominationHealth={false}
				>
					<Editor
						bondFor={bondFor}
						canSubmit={canManageNominations}
						dappName={NominateDappName}
						displayFor="default"
						eligibilityLoading={eligibilityLoading}
						ineligibleStatus={accountIsValidator ? 'validator' : 'notStaking'}
						optimalSelectionOnly
						poolId={poolId}
						selectionActionTarget={selectionActionTarget}
						standaloneCards
					/>
				</ManageNominationsProvider>
			</Page.Row>
		</>
	)
}
