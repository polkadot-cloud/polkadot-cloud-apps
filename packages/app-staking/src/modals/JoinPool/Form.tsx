// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { Polkicon } from '@w3ux/react-polkicon'
import { capitalizeFirstLetter, planckToUnit, unitToPlanck } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { PerbillMultiplier } from 'consts'
import { getStakingChainData } from 'consts/util'
import { defaultClaimPermission } from 'global-bus'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useBondGreatestFee } from 'hooks/useBondGreatestFee'
import { useNetwork } from 'hooks/useNetwork'
import { defaultPoolProgress, usePoolSetups } from 'hooks/usePoolSetups'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { SubmitTx } from 'library/SubmitTx'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { Padding } from 'ui-core/modal'
import { useOverlay } from 'ui-overlay'
import { planckToUnitBn } from 'utils'
import { HeaderWrapper, JoinFormWrapper } from './Wrappers'

export const Form = ({
	bondedPool,
	metadata,
}: {
	bondedPool: BondedPool
	metadata: string
}) => {
	const { t } = useTranslation()
	const {
		closeModal,
		setModalResize,
		config: { options },
	} = useOverlay().modal
	const { network } = useNetwork()
	const { newBatchCall } = useBatchCall()
	const { serviceApi, isReady } = useApi()
	const { setPoolSetup } = usePoolSetups()
	const { activeProxy } = useActiveProxy()
	const { getSignerWarnings } = useSignerWarnings()
	const { activeAddress, activeAccount } = useActiveAccount()
	const {
		balances: {
			pool: { totalPossibleBond },
		},
	} = useAccountBalances(activeAddress)

	const { unit, units } = getStakingChainData(network)
	const largestTxFee = useBondGreatestFee({ bondFor: 'pool' })

	// Bond amount to join pool with
	const [bond, setBond] = useState<{ bond: string }>({
		bond: planckToUnit(totalPossibleBond, units),
	})

	// Whether the bond amount is valid
	const [bondValid, setBondValid] = useState<boolean>(false)

	// feedback errors to trigger modal resize
	const [feedbackErrors, setFeedbackErrors] = useState<string[]>([])

	// Store the pool balance
	const [poolBalance, setPoolBalance] = useState<BigNumber | null>(null)

	// Handler to set bond on input change
	const handleSetBond = ({ value }: { value: BigNumber }) => {
		setBond({ bond: value.toString() })
	}

	// Whether the form is ready to submit
	const formValid = bondValid && feedbackErrors.length === 0

	const getTx = () => {
		if (!formValid) {
			return
		}
		const txs = serviceApi.tx.joinPool(
			bondedPool.id,
			unitToPlanck(!bondValid ? 0 : bond.bond, units),
			defaultClaimPermission,
		)
		if (!txs || (txs && !txs.length)) {
			return
		}
		return txs.length === 1
			? txs[0]
			: newBatchCall(txs, activeAddress, activeProxy)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: bondValid,
		callbackSubmit: () => {
			closeModal()
			// Optional callback function on join success.
			const onJoinCallback = options?.onJoinCallback
			if (typeof onJoinCallback === 'function') {
				onJoinCallback()
			}
		},
		callbackInBlock: async () => {
			// Reset local storage setup progress
			setPoolSetup(defaultPoolProgress)
		},
	})

	const warnings = getSignerWarnings(
		activeAccount,
		false,
		submitExtrinsic.proxySupported,
	)

	const poolCommission = bondedPool?.commission?.current?.[0]

	// Fetches the balance of the bonded pool
	const getPoolBalance = async () => {
		const apiResult = await serviceApi.runtimeApi.pointsToBalance(
			bondedPool.id,
			BigInt(bondedPool.points),
		)
		const balance = new BigNumber(apiResult || 0)
		if (balance) {
			setPoolBalance(new BigNumber(balance))
		}
	}

	// modal resize on form update
	useEffect(
		() => setModalResize(),
		[
			bond,
			bondValid,
			feedbackErrors.length,
			warnings.length,
			poolBalance?.toString(),
		],
	)

	// Fetch the balance when pool or points change
	useEffect(() => {
		if (isReady) {
			getPoolBalance()
		}
	}, [bondedPool.id, bondedPool.points, isReady])

	return (
		<>
			<Padding>
				<JoinFormWrapper>
					<HeaderWrapper>
						<Polkicon
							address={bondedPool?.addresses.stash || ''}
							background="transparent"
							fontSize="4rem"
						/>
						<div className="content">
							<h2>{metadata}</h2>
						</div>
						<div className="labels">
							{poolCommission && (
								<span>
									{poolCommission / PerbillMultiplier}%{' '}
									{t('commission', { ns: 'modals' })}
								</span>
							)}
							<span>
								{bondedPool.memberCounter}{' '}
								{t('member', { count: bondedPool.memberCounter, ns: 'app' })}
							</span>
							<span>
								{!poolBalance
									? `...`
									: `${planckToUnitBn(poolBalance, units)
											.decimalPlaces(0)
											.toFormat()} ${unit} ${capitalizeFirstLetter(t('bonded'))}`}
							</span>
						</div>
					</HeaderWrapper>
					<h4>
						{t('bond', { ns: 'app' })} {unit}
					</h4>
					<div className="input">
						<div>
							<BondFeedback
								joiningPool
								displayFirstWarningOnly
								syncing={largestTxFee.isZero()}
								bondFor={'pool'}
								listenIsValid={(valid, errors) => {
									setBondValid(valid)
									setFeedbackErrors(errors)
								}}
								defaultBond={null}
								setters={[handleSetBond]}
								parentErrors={warnings}
								txFees={BigInt(largestTxFee.toString())}
								bonding={false}
							/>
						</div>
					</div>
				</JoinFormWrapper>
			</Padding>
			<div>
				<SubmitTx
					displayFor="card"
					submitText={t('joinPool', { ns: 'pages' })}
					valid={formValid}
					{...submitExtrinsic}
					noMargin
					stacked
				/>
			</div>
		</>
	)
}
