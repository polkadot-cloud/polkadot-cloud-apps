// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { perbillToPercent, percentToPerbill } from 'utils'
import { MaxCommission } from './MaxCommission'
import { usePoolCommission } from './provider'

interface ManageMaxCommissionProps {
	onResize: () => void
	onBack: () => void
}

export const ManageMaxCommission = ({
	onResize,
	onBack,
}: ManageMaxCommissionProps) => {
	const { t } = useTranslation('modals')
	const {
		serviceApi,
		poolsConfig: { globalMaxCommission },
	} = useApi()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { isOwner, activePool } = useActivePool()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAccount } = useActiveAccount()
	const { getBondedPool, updateBondedPools } = useBondedPools()
	const { initial, current, hasValue, updated } = usePoolCommission()
	const globalMaxCommissionUnit =
		perbillToPercent(globalMaxCommission).toNumber()
	const poolId = activePool?.id || 0

	const invalidMaxCommission =
		hasValue.maxCommission && current.maxCommission > initial.maxCommission
	const maxCommissionAboveGlobal =
		current.maxCommission > globalMaxCommissionUnit
	const valid =
		isOwner() &&
		updated.maxCommission &&
		!invalidMaxCommission &&
		!maxCommissionAboveGlobal
	const maxCommissionPerbill = percentToPerbill(
		current.maxCommission,
	).toNumber()

	const tx = valid
		? serviceApi.tx.poolSetCommissionMax(poolId, maxCommissionPerbill)
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
							max: maxCommissionPerbill,
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
	if (!updated.maxCommission) {
		invalidWarnings.push(t('manageCommission.noMaxCommissionChangesWarning'))
	}
	if (invalidMaxCommission) {
		invalidWarnings.push(
			t('manageCommission.maxCommissionAboveExistingWarning', {
				existingMax: initial.maxCommission,
			}),
		)
	}
	if (maxCommissionAboveGlobal) {
		invalidWarnings.push(
			t('manageCommission.maxCommissionAboveGlobalMaxWarning', {
				max: globalMaxCommissionUnit,
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
				<MaxCommission />
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
