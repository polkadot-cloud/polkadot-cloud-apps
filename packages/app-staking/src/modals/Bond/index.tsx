// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { maxBigInt, planckToUnit, unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBalances } from 'hooks/useBalances'
import { useBondGreatestFee } from 'hooks/useBondGreatestFee'
import { useNetwork } from 'hooks/useNetwork'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useStaking } from 'hooks/useStaking'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { Warning } from 'library/Form/Warning'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Padding, Title, Warnings } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const Bond = () => {
	const { t } = useTranslation('modals')
	const {
		closeModal,
		config: { options },
		setModalResize,
	} = useOverlay().modal
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const { isBonding } = useStaking()
	const { activeProxy } = useActiveProxy()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { balances } = useAccountBalances(activeAddress)
	const { getPendingPoolRewards, getPoolMembership } = useBalances()

	const { membership } = getPoolMembership(activeAddress)
	const { unit, units } = getStakingChainData(network)

	const { bondFor } = options
	const isStaking = bondFor === 'nominator'
	const isPooling = bondFor === 'pool'
	const { nominator, transferableBalance } = balances

	// `totalAdditionalBond` and `transferableBalance` already have `feeReserve`
	// deducted.
	const availableBalance =
		bondFor === 'nominator'
			? nominator.totalAdditionalBond
			: transferableBalance

	const largestTxFee = useBondGreatestFee({ bondFor })
	const pendingRewards = getPendingPoolRewards(activeAddress)
	const pendingRewardsUnit = planckToUnit(pendingRewards, units)

	// local bond value.
	const [bond, setBond] = useState('')

	// bond valid.
	const [bondValid, setBondValid] = useState(false)

	const bondPlanck = unitToPlanck(bond || '0', units)
	const largestTxFeePlanck = BigInt(largestTxFee.toFixed(0))
	const maxBond = maxBigInt(availableBalance - largestTxFeePlanck, 0n)
	const formValid = bondValid && bondPlanck > 0n && bondPlanck <= maxBond

	const getTx = () => {
		if (!activeAddress || !formValid) {
			return
		}
		if (isPooling) {
			return serviceApi.tx.poolBondExtra('FreeBalance', bondPlanck)
		}
		if (isStaking) {
			return serviceApi.tx.stakingBondExtra(bondPlanck)
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

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	useEffect(() => {
		setBond('')
		setBondValid(false)
	}, [activeAddress, bondFor])

	// modal resize on form update
	useEffect(() => setModalResize(), [bond, bondValid, warnings.length])

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('addToBond')}</Title>
				{pendingRewards > 0n && bondFor === 'pool' ? (
					<Warnings>
						<Warning
							text={`${t('bondingWithdraw')} ${pendingRewardsUnit} ${unit}.`}
						/>
					</Warnings>
				) : null}
				<BondFeedback
					value={bond}
					onChange={setBond}
					syncing={largestTxFee.isZero()}
					bondFor={bondFor}
					listenIsValid={setBondValid}
					parentErrors={warnings}
					txFees={largestTxFeePlanck}
					bonding={
						(bondFor === 'nominator' && isBonding) ||
						(bondFor === 'pool' && !!membership)
					}
				/>
				<p>{t('newlyBondedFunds')}</p>
			</Padding>
			<SubmitTx
				submitText={t('bond', { ns: 'modals' })}
				valid={formValid}
				{...submitExtrinsic}
			/>
		</>
	)
}
