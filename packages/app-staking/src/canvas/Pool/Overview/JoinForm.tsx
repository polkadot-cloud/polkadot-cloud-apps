// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import type BigNumber from 'bignumber.js'
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
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { ClaimPermissionInput } from 'library/Form/ClaimPermissionInput'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import type { BondedPool, ClaimPermission } from 'types'
import { SubmitTx } from 'ui-app/SubmitTx'
import { ButtonPrimaryInvert } from 'ui-buttons'
import { useOverlay } from 'ui-overlay'
import type { OverviewSectionProps } from '../types'
import { JoinFormWrapper } from '../Wrappers'

export const JoinForm = ({
	bondedPool,
	providedPoolId,
	poolCandidates,
	setSelectedPoolId,
}: OverviewSectionProps & {
	providedPoolId: number
	poolCandidates: BondedPool[]
	setSelectedPoolId: Dispatch<SetStateAction<number>>
}) => {
	const { t } = useTranslation()
	const { serviceApi } = useApi()
	const { network } = useNetwork()
	const {
		closeCanvas,
		config: { options },
	} = useOverlay().canvas
	const { newBatchCall } = useBatchCall()
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

	// Pool claim permission value.
	const [claimPermission, setClaimPermission] = useState<ClaimPermission>(
		defaultClaimPermission,
	)

	// Bond amount to join pool with.
	const [bond, setBond] = useState<{ bond: string }>({
		bond: planckToUnit(totalPossibleBond, units),
	})

	// Whether the bond amount is valid.
	const [bondValid, setBondValid] = useState<boolean>(false)

	// feedback errors to trigger modal resize
	const [feedbackErrors, setFeedbackErrors] = useState<string[]>([])

	// Handler to set bond on input change.
	const handleSetBond = ({
		value,
		inputValue,
	}: {
		value: BigNumber
		inputValue?: string
	}) => {
		setBond({ bond: inputValue ?? value.toFixed() })
	}

	// Whether the form is ready to submit.
	const formValid = bondValid && feedbackErrors.length === 0

	const getTx = () => {
		if (!claimPermission || !formValid) {
			return
		}
		const txs = serviceApi.tx.joinPool(
			bondedPool.id,
			unitToPlanck(!bondValid ? 0 : bond.bond, units),
			claimPermission,
		)
		if (!txs || (txs && !txs.length)) {
			return
		}
		return txs.length === 1
			? txs[0]
			: newBatchCall(txs, activeAddress, activeProxy)
	}

	// Randomly select a new pool to display
	const handleChooseNewPool = () => {
		// Remove current pool from filtered so it is not selected again
		const filteredPools = poolCandidates.filter(
			(pool) => Number(pool.id) !== Number(bondedPool.id),
		)
		const newCandidate =
			filteredPools[Math.floor(Math.random() * filteredPools.length)]?.id
		setSelectedPoolId(newCandidate)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tx: getTx(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: bondValid,
		callbackSubmit: () => {
			closeCanvas()
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

	// In dev mode, allow choosing a new pool even if a poolId is provided
	const choosePoolEnabled =
		import.meta.env.MODE === 'development' || providedPoolId === null

	return (
		<JoinFormWrapper>
			<div className="head">
				<h2>{t('joinPool', { ns: 'pages' })}</h2>
				{choosePoolEnabled && (
					<ButtonPrimaryInvert
						text={t('chooseAnotherPool', { ns: 'app' })}
						iconLeft={faArrowsRotate}
						onClick={() => handleChooseNewPool()}
					/>
				)}
			</div>
			<h4>
				{t('bond', { ns: 'app' })} {unit}
			</h4>
			<div className="input">
				<div>
					<BondFeedback
						displayFor="canvas"
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
			<h4 className="underline">{t('claimSetting', { ns: 'app' })}</h4>
			<ClaimPermissionInput
				current={claimPermission}
				onChange={(val: ClaimPermission) => {
					setClaimPermission(val)
				}}
			/>
			<div className="submit">
				<SubmitTx
					submitText={t('joinPool', { ns: 'pages' })}
					valid={formValid}
					{...submitExtrinsic}
					noMargin
					stacked
				/>
			</div>
		</JoinFormWrapper>
	)
}
