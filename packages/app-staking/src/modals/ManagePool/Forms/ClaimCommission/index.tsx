// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { ActionItem } from 'library/ActionItem'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Notes, Padding, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'

export const ClaimCommission = ({
	setSection,
	onResize,
}: {
	setSection: Dispatch<SetStateAction<number>>
	onResize: () => void
}) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { serviceApi } = useApi()
	const { closeModal } = useOverlay().modal
	const { activeProxy } = useActiveProxy()
	const { activeAccount } = useActiveAccount()
	const { isOwner, activePool } = useActivePool()
	const { getSignerWarnings } = useSignerWarnings()

	const { unit, units } = getStakingChainData(network)
	const poolId = activePool?.id
	const pendingCommission = new BigNumber(
		activePool?.rewardPool?.totalCommissionPending || 0,
	)

	// valid to submit transaction
	const [valid, setValid] = useState<boolean>(false)

	useEffect(() => {
		setValid(isOwner() && pendingCommission.isGreaterThan(0))
	}, [activePool, pendingCommission])

	const getTx = () => {
		if (!valid || poolId === undefined) {
			return
		}
		return serviceApi.tx.poolClaimCommission(poolId)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	return (
		<>
			<Padding horizontalOnly>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<ActionItem
					text={`${t('claim')} ${planckToUnitBn(
						pendingCommission,
						units,
					).toString()} ${unit} `}
				/>
				<Notes>
					<p>{t('sentToCommissionPayee')}</p>
				</Notes>
			</Padding>
			<ModalBack onClick={() => setSection(0)} />
			<SubmitTx
				noMargin
				submitText={t('claim', { ns: 'modals' })}
				valid={valid}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
