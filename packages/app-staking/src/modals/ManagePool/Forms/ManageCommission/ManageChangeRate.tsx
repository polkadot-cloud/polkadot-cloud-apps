// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { percentToPerbill } from 'utils'
import { ChangeRate } from './ChangeRate'
import { usePoolCommission } from './provider'

interface ManageChangeRateProps {
	onResize: () => void
	onBack: () => void
}

export const ManageChangeRate = ({
	onResize,
	onBack,
}: ManageChangeRateProps) => {
	const { t } = useTranslation('modals')
	const { serviceApi } = useApi()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { isOwner, activePool } = useActivePool()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAccount } = useActiveAccount()
	const { getBondedPool, updateBondedPools } = useBondedPools()
	const { initial, current, updated } = usePoolCommission()
	const poolId = activePool?.id || 0

	const invalidMaxIncrease =
		current.changeRate.maxIncrease > initial.changeRate.maxIncrease
	const invalidMinDelay =
		current.changeRate.minDelay < initial.changeRate.minDelay
	const valid =
		isOwner() && updated.changeRate && !invalidMaxIncrease && !invalidMinDelay
	const maxIncreasePerbill = percentToPerbill(
		current.changeRate.maxIncrease,
	).toNumber()

	const tx = valid
		? serviceApi.tx.poolSetCommissionChangeRate(
				poolId,
				maxIncreasePerbill,
				current.changeRate.minDelay,
			)
		: undefined

	const submitExtrinsic = useSubmitExtrinsic({
		tx,
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: valid,
		callbackSubmit: () => {
			closeModal()
		},
		callbackInBlock: () => {
			const pool = getBondedPool(poolId)
			if (pool) {
				updateBondedPools([
					{
						...pool,
						commission: {
							...pool.commission,
							changeRate: {
								maxIncrease: maxIncreasePerbill,
								minDelay: current.changeRate.minDelay,
							},
						},
					},
				])
			}
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	const invalidWarnings: string[] = []
	if (!updated.changeRate) {
		invalidWarnings.push(t('manageCommission.noChangeRateChangesWarning'))
	}
	if (invalidMaxIncrease) {
		invalidWarnings.push(
			t('manageCommission.changeRateAboveExistingWarning', {
				existingMaxIncrease: initial.changeRate.maxIncrease,
			}),
		)
	}
	if (invalidMinDelay) {
		invalidWarnings.push(
			t('manageCommission.changeRateBelowExistingWarning', {
				existingMinDelay: initial.changeRate.minDelay,
			}),
		)
	}

	const visibleInvalidWarnings = valid ? [] : invalidWarnings
	const warningContentSignature = `${warnings.join('::')}|${visibleInvalidWarnings.join('::')}`

	useEffect(() => {
		onResize()
	}, [onResize, warningContentSignature])

	return (
		<>
			<Padding horizontalOnly>
				<Warnings>
					{warnings.map((text) => (
						<Warning key={`warning${text}`} text={text} />
					))}
					{visibleInvalidWarnings.map((text) => (
						<Warning key={`invalid-warning${text}`} text={text} />
					))}
				</Warnings>
				<ChangeRate />
			</Padding>
			<ModalBack onClick={onBack} />
			<SubmitTx
				noMargin
				valid={valid}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
