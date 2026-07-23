// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import { useActiveAccount } from '@polkadot-cloud/connect'
import { unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { defaultClaimPermission } from 'global-bus'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useBondGreatestFee } from 'hooks/useBondGreatestFee'
import { useNetwork } from 'hooks/useNetwork'
import { defaultPoolProgress, usePoolSetups } from 'hooks/usePoolSetups'
import { useSignerWarnings } from 'hooks/useSignerWarnings'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { ClaimPermissionInput } from 'library/Form/ClaimPermissionInput'
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
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
	const { unit, units } = getStakingChainData(network)
	const largestTxFee = useBondGreatestFee({ bondFor: 'pool' })

	// Pool claim permission value.
	const [claimPermission, setClaimPermission] = useState<ClaimPermission>(
		defaultClaimPermission,
	)

	// Bond amount to join pool with.
	const [bond, setBond] = useState('')

	// Whether the bond amount is valid.
	const [bondValid, setBondValid] = useState(false)
	const bondPlanck = unitToPlanck(bond || '0', units)
	const formValid = bondValid && bondPlanck > 0n

	const getTx = () => {
		if (!claimPermission || !formValid) {
			return
		}
		const txs = serviceApi.tx.joinPool(
			bondedPool.id,
			bondPlanck,
			claimPermission,
		)
		if (!txs?.length) {
			return
		}
		return txs.length === 1
			? txs[0]
			: newBatchCall(txs, activeAddress, activeProxy)
	}

	useEffect(() => {
		setBond('')
		setBondValid(false)
	}, [activeAddress])

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
		shouldSubmit: formValid,
		callbackSubmit: () => {
			closeCanvas()
			// Optional callback function on join success.
			const onJoinCallback = options?.onJoinCallback
			if (typeof onJoinCallback === 'function') {
				onJoinCallback()
			}
		},
		callbackInBlock: () => {
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
						onClick={handleChooseNewPool}
					/>
				)}
			</div>
			<h4>
				{t('bond', { ns: 'app' })} {unit}
			</h4>
			<div className="input">
				<div>
					<BondFeedback
						value={bond}
						onChange={setBond}
						displayFor="canvas"
						syncing={largestTxFee.isZero()}
						bondFor="pool"
						listenIsValid={setBondValid}
						parentErrors={warnings}
						txFees={BigInt(largestTxFee.toFixed(0))}
					/>
				</div>
			</div>
			<h4 className="underline">{t('claimSetting', { ns: 'app' })}</h4>
			<ClaimPermissionInput
				current={claimPermission}
				onChange={setClaimPermission}
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
