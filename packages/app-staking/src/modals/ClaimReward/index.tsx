// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import type { SubmittableExtrinsic } from 'dedot'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ActionItem, Padding, Title, Warnings } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const ClaimReward = () => {
	const { t } = useTranslation('modals')
	const {
		closeModal,
		config: { options },
		setModalResize,
	} = useOverlay().modal
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { activePool } = useActivePool()
	const { activeProxy } = useActiveProxy()
	const { getPendingPoolRewards } = useBalances()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()

	const { claimType } = options
	const { unit, units } = getStakingChainData(network)
	const pendingRewards = getPendingPoolRewards(activeAddress)

	// ensure selected payout is valid
	useEffect(() => {
		if (pendingRewards > 0) {
			setValid(true)
		} else {
			setValid(false)
		}
	}, [activePool])

	// valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)

	const getTx = () => {
		let tx: SubmittableExtrinsic | undefined
		if (claimType === 'bond') {
			tx = serviceApi.tx.poolBondExtra('Rewards')
		} else {
			tx = serviceApi.tx.poolClaimPayout()
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
		false,
		submitExtrinsic.proxySupported,
	)

	if (pendingRewards === 0n) {
		warnings.push(`${t('noRewards')}`)
	}

	useEffect(() => setModalResize(), [warnings.length])

	return (
		<>
			<Close />
			<Padding>
				<Title>
					{claimType === 'bond' ? t('compound') : t('withdraw')} {t('rewards')}
				</Title>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<ActionItem
					text={`${t('claim')} ${`${planckToUnit(
						pendingRewards.toString(),
						units,
					)} ${unit}`}`}
				/>
				{claimType === 'bond' ? (
					<p>{t('claimReward1')}</p>
				) : (
					<p>{t('claimReward2')}</p>
				)}
			</Padding>
			<SubmitTx
				submitText={t(claimType === 'bond' ? 'compound' : 'claim', {
					ns: 'modals',
				})}
				valid={valid}
				{...submitExtrinsic}
			/>
		</>
	)
}
