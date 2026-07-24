// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActivePool } from 'hooks/useActivePool'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
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
	const { activeProxy } = useActiveProxy()
	const { getPendingPoolRewards } = useBalances()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { isDepositor, activePool } = useActivePool()
	const {
		serviceApi,
		poolsConfig: { minJoinBond: minJoinBondBn, minCreateBond: minCreateBondBn },
	} = useApi()
	const { minNominatorBond: minNominatorBondBigInt } = useStakingMetrics()
	const {
		closeModal,
		replaceModal,
		setModalResize,
		config: { options },
	} = useOverlay().modal
	const { bondFor } = options
	const { unbondDuration, formatUnbondDuration } = useUnbondDuration()
	const { unit, units } = getStakingChainData(network)
	const pendingRewards = getPendingPoolRewards(activeAddress)

	const unbondDurationFormatted = formatUnbondDuration(t)

	const pendingRewardsUnit = planckToUnit(pendingRewards, units)

	const isStaking = bondFor === 'nominator'
	const isPooling = bondFor === 'pool'
	const poolDepositor = isDepositor()
	const activePoolId = activePool?.id
	const { active } = isPooling ? balances.pool : balances.nominator

	const minJoinBond = planckToUnit(minJoinBondBn, units)
	const minCreateBond = planckToUnit(minCreateBondBn, units)
	const [bond, setBond] = useState('')
	const pointsKey = `${network}:${activeAddress ?? ''}:${activePoolId ?? ''}`
	const [resolvedPoints, setResolvedPoints] = useState<{
		key: string
		value: string
		points: bigint
		api: typeof serviceApi
	} | null>(null)

	const [bondValid, setBondValid] = useState(false)

	useEffect(() => {
		let cancelled = false
		setResolvedPoints(null)
		if (!isPooling || activePoolId === undefined || !bond) {
			return
		}

		void serviceApi.runtimeApi
			.balanceToPoints(activePoolId, unitToPlanck(bond, units))
			.then((points) => {
				if (!cancelled) {
					setResolvedPoints({
						key: pointsKey,
						value: bond,
						points,
						api: serviceApi,
					})
				}
			})
			.catch(() => undefined)

		return () => {
			cancelled = true
		}
	}, [activePoolId, bond, isPooling, pointsKey, serviceApi, units])

	const bondPlanck = unitToPlanck(bond || '0', units)
	const formValid =
		bondValid &&
		bondPlanck > 0n &&
		(!isPooling ||
			(resolvedPoints?.api === serviceApi &&
				resolvedPoints.key === pointsKey &&
				resolvedPoints.value === bond &&
				resolvedPoints.points > 0n))

	const getTx = () => {
		if (!activeAddress || !formValid) {
			return
		}
		if (isPooling) {
			if (!resolvedPoints) {
				return
			}
			return serviceApi.tx.poolUnbond(activeAddress, resolvedPoints.points)
		}
		if (isStaking) {
			return serviceApi.tx.stakingUnbond(bondPlanck)
		}
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: formValid,
		callbackSubmit: () => {
			closeModal()
		},
	})

	const nominatorActiveBelowMin =
		bondFor === 'nominator' && active > 0n && active < minNominatorBondBigInt

	const poolToMin = poolDepositor ? minCreateBondBn : minJoinBondBn
	const poolActiveBelowMin = bondFor === 'pool' && active < poolToMin
	const openUnstakeModal = () => replaceModal({ key: 'Unstake', size: 'sm' })

	// accumulate warnings.
	const warnings = getSignerWarnings(
		activeAccount,
		isStaking,
		submitExtrinsic.proxySupported,
	)

	if (pendingRewards > 0n && bondFor === 'pool') {
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

	useEffect(() => {
		setBond('')
		setBondValid(false)
	}, [activeAddress, activePoolId, bondFor, network])

	// Modal resize on form update.
	useEffect(
		() => setModalResize(),
		[bond, bondValid, warnings.length, nominatorActiveBelowMin],
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
					value={bond}
					onChange={setBond}
					bondFor={bondFor}
					listenIsValid={setBondValid}
				/>
				<Notes withPadding>
					{bondFor === 'pool' ? (
						poolDepositor ? (
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
				valid={formValid}
				{...submitExtrinsic}
			/>
		</>
	)
}
