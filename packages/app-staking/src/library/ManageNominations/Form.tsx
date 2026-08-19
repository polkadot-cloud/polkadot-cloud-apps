// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useManageNominations } from 'contexts/ManageNominations'
import { useTranslation } from 'react-i18next'
import type { UseSubmitExtrinsic } from 'tx-submit/types'
import { SubmitTx } from 'ui-app/SubmitTx'
import { NominationSummary, SubmitTxContainer } from './Wrappers'

export const Form = ({
	valid,
	requiresMigratedController,
	submitExtrinsic,
}: {
	valid: boolean
	requiresMigratedController: boolean
	submitExtrinsic: UseSubmitExtrinsic
}) => {
	const { t } = useTranslation('app')
	const { defaultNominations, nominations } = useManageNominations()

	const defaultNominationAddresses = new Set(
		defaultNominations.map(({ address }) => address),
	)
	const nominationAddresses = new Set(nominations.map(({ address }) => address))
	const addedNominations = nominations.filter(
		({ address }) => !defaultNominationAddresses.has(address),
	).length
	const removedNominations = defaultNominations.filter(
		({ address }) => !nominationAddresses.has(address),
	).length
	const nominationCountLabel = (count: number) =>
		count === 0
			? t('none', { ns: 'pages' })
			: `${count} ${t('nominations', { count })}`

	return (
		<>
			<NominationSummary>
				<h3>{t('summary', { ns: 'pages' })}</h3>
				<div className="row">
					<span>{t('nominationsAdded')}</span>
					<span>{nominationCountLabel(addedNominations)}</span>
				</div>
				<div className="row">
					<span>{t('nominationsRemoved')}</span>
					<span>{nominationCountLabel(removedNominations)}</span>
				</div>
				<div className="row total">
					<span>{t('totalNominations')}:</span>
					<span>{nominations.length}</span>
				</div>
			</NominationSummary>
			<SubmitTxContainer>
				<SubmitTx
					noMargin
					requiresMigratedController={requiresMigratedController}
					valid={valid}
					displayFor="card"
					stacked
					transparent
					hideSigner
					{...submitExtrinsic}
				/>
			</SubmitTxContainer>
		</>
	)
}
