// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { getUnixTime } from 'date-fns'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useErasToTimeLeft } from 'hooks/useErasToTimeLeft'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { ActionItem } from 'library/ActionItem'
import { Warning } from 'library/Form/Warning'
import { ModalBack } from 'library/ModalBack'
import { SubmitTx } from 'library/SubmitTx'
import { StaticNote } from 'modals/Utils/StaticNote'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Padding, Title, Warnings } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { timeleftAsString } from 'utils'

export const LeavePool = ({
	onResize,
	onClick,
}: {
	onResize?: () => void
	onClick?: () => void
}) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { activePool } = useActivePool()
	const { getConsts, serviceApi } = useApi()
	const { erasToSeconds } = useErasToTimeLeft()
	const { closeModal } = useOverlay().modal
	const { activeProxy } = useActiveProxy()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { getPoolMembership, getPendingPoolRewards } = useBalances()

	const { unit, units } = getStakingChainData(network)
	const { active: activeBn } = balances.pool
	const { bondDuration } = getConsts(network)
	const pendingRewards = getPendingPoolRewards(activeAddress)
	const { membership } = getPoolMembership(activeAddress)
	const bondDurationFormatted = timeleftAsString(
		t,
		getUnixTime(new Date()) + 1,
		erasToSeconds(bondDuration),
		true,
	)
	const freeToUnbond = planckToUnit(activeBn, units)
	const pendingRewardsUnit = planckToUnit(pendingRewards, units)

	const [paramsValid, setParamsValid] = useState<boolean>(false)

	useEffect(() => {
		setParamsValid((membership?.points || 0n) > 0 && !!activePool?.id)
	}, [freeToUnbond])

	const getTx = () => {
		if (!activeAddress || !membership) {
			return
		}
		return serviceApi.tx.poolUnbond(activeAddress, membership.points)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: paramsValid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	if (pendingRewards > 0) {
		warnings.push(
			`${t('unbondingWithdraw')} ${pendingRewardsUnit.toString()} ${unit}.`,
		)
	}

	return (
		<>
			<Padding>
				<Title>{t('unstake')}</Title>
				{warnings.length > 0 ? (
					<Warnings>
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<ActionItem
					text={`${t('unbond')} ${freeToUnbond.toString()} ${unit}`}
				/>
				<StaticNote
					value={bondDurationFormatted}
					tKey="onceUnbonding"
					valueKey="bondDurationFormatted"
					deps={[bondDuration]}
				/>
			</Padding>
			{!!onClick && <ModalBack onClick={onClick} />}
			<SubmitTx
				noMargin
				submitText={t('leavePool', { ns: 'modals' })}
				valid={paramsValid}
				onResize={onResize}
				{...submitExtrinsic}
			/>
		</>
	)
}
