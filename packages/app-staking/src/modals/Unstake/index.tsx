// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useBatchCall } from 'hooks/useBatchCall'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { useUnbondDuration } from 'hooks/useUnbondDuration'
import { Warning } from 'library/Form/Warning'
import { StaticNote } from 'modals/Utils/StaticNote'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ActionItem, Padding, Title, Warnings } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const Unstake = () => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { newBatchCall } = useBatchCall()
	const { getNominations } = useBalances()
	const { activeProxy } = useActiveProxy()
	const { serviceApi } = useApi()
	const { getSignerWarnings } = useSignerWarnings()
	const { closeModal, setModalResize } = useOverlay().modal
	const { activeAddress, activeAccount } = useActiveAccount()

	const { balances } = useAccountBalances(activeAddress)
	const { unbondDuration, formatUnbondDuration } = useUnbondDuration()
	const { unit, units } = getStakingChainData(network)
	const nominations = getNominations(activeAddress)
	const { active } = balances.nominator

	const unbondDurationFormatted = formatUnbondDuration(t)

	// convert BigNumber values to number
	const freeToUnbond = new BigNumber(planckToUnit(active, units))

	// local bond value
	const [bond, setBond] = useState<{ bond: string }>({
		bond: freeToUnbond.toString(),
	})

	// bond valid
	const [bondValid, setBondValid] = useState<boolean>(false)

	// unbond all validation
	const isValid = (() => freeToUnbond.isGreaterThan(0))()

	// update bond value on task change
	useEffect(() => {
		setBond({ bond: freeToUnbond.toString() })
		setBondValid(isValid)
	}, [freeToUnbond.toString(), isValid])

	// modal resize on form update
	useEffect(() => setModalResize(), [bond])

	const getTx = () => {
		if (!activeAddress) {
			return
		}
		const bondToSubmit = unitToPlanck(String(!bondValid ? 0 : bond.bond), units)
		if (bondToSubmit === 0n) {
			return serviceApi.tx.stakingChill()
		}
		const txs = [
			serviceApi.tx.stakingChill(),
			serviceApi.tx.stakingUnbond(bondToSubmit),
		].filter((tx) => tx !== undefined)

		return newBatchCall(txs, activeAddress, activeProxy)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: bondValid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		true,
		submitExtrinsic.proxySupported,
	)

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('unstake')} </Title>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				{freeToUnbond.isGreaterThan(0) ? (
					<ActionItem
						text={t('unstakeUnbond', {
							bond: freeToUnbond.toFormat(),
							unit,
						})}
					/>
				) : null}
				{nominations.length > 0 && (
					<ActionItem
						text={t('unstakeStopNominating', { count: nominations.length })}
					/>
				)}
				<StaticNote
					value={unbondDurationFormatted}
					tKey="onceUnbonding"
					valueKey="bondDurationFormatted"
					deps={[unbondDuration]}
				/>
			</Padding>
			<SubmitTx
				requiresMigratedController
				submitText={t('unstake', { ns: 'modals' })}
				valid={bondValid}
				{...submitExtrinsic}
			/>
		</>
	)
}
