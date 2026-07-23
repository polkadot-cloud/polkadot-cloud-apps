// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import type { SubmittableExtrinsic } from 'dedot'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import { useTxMeta } from 'hooks/useTxMeta'
import { useUnbondDuration } from 'hooks/useUnbondDuration'
import { UnbondFeedback } from 'library/Form/Unbond/UnbondFeedback'
import { Warning, WarningLink } from 'library/Form/Warning'
import { StaticNote } from 'modals/Utils/StaticNote'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Notes, Padding, Title, Warnings } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const Unbond = () => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { getTxSubmission } = useTxMeta()
	const { activeProxy } = useActiveProxy()
	const { getPendingPoolRewards } = useBalances()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { isDepositor, activePool } = useActivePool()
	const { serviceApi } = useApi()
	const { minNominatorBond: minNominatorBondBigInt } = useStakingMetrics()
	const {
		closeModal,
		replaceModal,
		setModalResize,
		config: { options },
	} = useOverlay().modal
	const {
		poolsConfig: { minJoinBond: minJoinBondBn, minCreateBond: minCreateBondBn },
	} = useApi()

	const { bondFor } = options
	const { unbondDuration, formatUnbondDuration } = useUnbondDuration()
	const { unit, units } = getStakingChainData(network)
	const pendingRewards = getPendingPoolRewards(activeAddress)

	const unbondDurationFormatted = formatUnbondDuration(t)

	const pendingRewardsUnit = planckToUnit(pendingRewards, units)

	const isStaking = bondFor === 'nominator'
	const isPooling = bondFor === 'pool'
	const { active } = isPooling ? balances.pool : balances.nominator

	// convert BigNumber values to number
	const freeToUnbond = new BigNumber(planckToUnit(active, units))
	const minJoinBond = new BigNumber(planckToUnit(minJoinBondBn, units))
	const minCreateBond = new BigNumber(planckToUnit(minCreateBondBn, units))
	const minNominatorBond = new BigNumber(
		planckToUnit(minNominatorBondBigInt, units),
	)

	const [bond, setBond] = useState<{ bond: string }>({
		bond: freeToUnbond.toFixed(),
	})
	const [points, setPoints] = useState<bigint>(0n)

	const [bondValid, setBondValid] = useState<boolean>(false)

	// handler to set bond as a string
	const handleSetBond = async ({
		value,
		inputValue,
	}: {
		value: BigNumber
		inputValue?: string
	}) => {
		const fixedValue = inputValue ?? value.toFixed()
		if (isPooling && activePool) {
			const balancePoints = await serviceApi.runtimeApi.balanceToPoints(
				activePool.id,
				unitToPlanck(fixedValue, units),
			)
			setPoints(balancePoints)
		}
		setBond({ bond: fixedValue })
	}

	// feedback errors to trigger modal resize
	const [feedbackErrors, setFeedbackErrors] = useState<string[]>([])

	// get the max amount available to unbond
	const unbondToMin = isPooling
		? isDepositor()
			? BigNumber.max(freeToUnbond.minus(minCreateBond), 0)
			: BigNumber.max(freeToUnbond.minus(minJoinBond), 0)
		: BigNumber.max(freeToUnbond.minus(minNominatorBond), 0)

	const getTx = () => {
		let tx: SubmittableExtrinsic | undefined
		if (!activeAddress) {
			return
		}
		const bondToSubmit = unitToPlanck(!bondValid ? 0 : bond.bond, units)
		if (isPooling) {
			tx = serviceApi.tx.poolUnbond(activeAddress, points)
		} else if (isStaking) {
			tx = serviceApi.tx.stakingUnbond(bondToSubmit)
		}
		return tx
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: bondValid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const fee = getTxSubmission(submitExtrinsic.uid)?.fee || 0n

	const nominatorActiveBelowMin =
		bondFor === 'nominator' && active > 0n && active < minNominatorBondBigInt

	const poolToMin = isDepositor() ? minCreateBondBn : minJoinBondBn
	const poolActiveBelowMin = bondFor === 'pool' && active < poolToMin
	const openUnstakeModal = () => replaceModal({ key: 'Unstake', size: 'sm' })

	// accumulate warnings.
	const warnings = getSignerWarnings(
		activeAccount,
		isStaking,
		submitExtrinsic.proxySupported,
	)

	if (pendingRewards > 0 && bondFor === 'pool') {
		warnings.push(`${t('unbondingWithdraw')} ${pendingRewardsUnit} ${unit}.`)
	}
	if (poolActiveBelowMin) {
		warnings.push(
			t('unbondErrorBelowMinimum', {
				bond: planckToUnit(poolToMin, units),
				unit,
			}),
		)
	}
	if (active === 0n) {
		warnings.push(t('unbondErrorNoFunds', { unit }))
	}

	// Update bond value on task change
	useEffect(() => {
		handleSetBond({ value: unbondToMin })
	}, [freeToUnbond.toString()])

	// Modal resize on form update.
	useEffect(
		() => setModalResize(),
		[bond, feedbackErrors.length, warnings.length, nominatorActiveBelowMin],
	)

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('removeBond')}</Title>
				{warnings.length > 0 || nominatorActiveBelowMin ? (
					<Warnings>
						{nominatorActiveBelowMin && (
							<Warning
								status="danger"
								text={
									<Trans
										ns="modals"
										i18nKey="mustUnstakeToFreeBondedFunds"
										components={{
											unstake: (
												<WarningLink type="button" onClick={openUnstakeModal} />
											),
										}}
									/>
								}
							/>
						)}
						{warnings.map((text) => (
							<Warning key={`warning_${text}`} text={text} />
						))}
					</Warnings>
				) : null}
				<UnbondFeedback
					bondFor={bondFor}
					listenIsValid={(valid, errors) => {
						setBondValid(valid)
						setFeedbackErrors(errors)
					}}
					setters={[handleSetBond]}
					txFees={fee}
				/>
				<Notes withPadding>
					{bondFor === 'pool' ? (
						isDepositor() ? (
							<p>
								{t('notePoolDepositorMinBond', {
									context: 'depositor',
									bond: minCreateBond,
									unit,
								})}
							</p>
						) : (
							<p>
								{t('notePoolDepositorMinBond', {
									context: 'member',
									bond: minJoinBond,
									unit,
								})}
							</p>
						)
					) : null}
					<StaticNote
						value={unbondDurationFormatted}
						tKey="onceUnbonding"
						valueKey="bondDurationFormatted"
						deps={[unbondDuration]}
					/>
				</Notes>
			</Padding>
			<SubmitTx
				noMargin
				submitText={t('unbond', { ns: 'modals' })}
				requiresMigratedController={isStaking}
				valid={bondValid}
				{...submitExtrinsic}
			/>
		</>
	)
}
