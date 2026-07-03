// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import type { SubmittableExtrinsic } from 'dedot'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { SubmitTx } from 'library/SubmitTx'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Padding, Title, Warnings } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const StopNominations = () => {
	const { t } = useTranslation('modals')
	const {
		closeModal,
		config: { options },
	} = useOverlay().modal
	const { serviceApi } = useApi()
	const { getNominations } = useBalances()
	const { activeProxy } = useActiveProxy()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { activePoolNominations, isNominator, isOwner, activePool } =
		useActivePool()

	const { bondFor } = options
	const isPool = bondFor === 'pool'
	const isStaking = bondFor === 'nominator'

	const nominations = isPool
		? activePoolNominations?.targets || []
		: getNominations(activeAddress)

	// valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)

	// ensure selected key is valid
	useEffect(() => {
		setValid(nominations.length > 0)
	}, [nominations])

	// ensure roles are valid
	let isValid = nominations.length > 0
	if (isPool) {
		isValid = (isNominator() || isOwner()) ?? false
	}

	const getTx = () => {
		let tx: SubmittableExtrinsic | undefined
		if (!valid) {
			return
		}
		if (isPool) {
			tx = serviceApi.tx.poolChill(activePool?.id || 0)
		} else if (isStaking) {
			tx = serviceApi.tx.stakingChill()
		}
		return tx
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		isStaking,
		submitExtrinsic.proxySupported,
	)

	if (!nominations.length) {
		warnings.push(`${t('noNominationsSet')}`)
	}

	useEffect(() => setValid(isValid), [isValid])

	return (
		<>
			<Close />
			<Padding>
				<Title>
					{t('stop')} {t('allNominations')}
				</Title>
				{warnings.length ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<p>{t('changeNomination')}</p>
			</Padding>
			<SubmitTx
				requiresMigratedController={isStaking}
				submitText={t('stopNominating', { ns: 'modals' })}
				valid={valid}
				{...submitExtrinsic}
			/>
		</>
	)
}
