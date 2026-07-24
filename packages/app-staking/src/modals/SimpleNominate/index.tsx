// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { unitToPlanck } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import type { PalletStakingRewardDestination } from 'dedot/chaintypes'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useNetwork } from 'hooks/useNetwork'
import { useTxMeta } from 'hooks/useTxMeta'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { Warning } from 'library/Form/Warning'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSubmitExtrinsic } from 'tx-submit/useSubmitExtrinsic'
import { formatFromProp } from 'tx-submit/util'
import { SubmitTx } from 'ui-app/SubmitTx'
import { Separator } from 'ui-core/base'
import { Padding, Title } from 'ui-core/modal'
import { Close, useOverlay } from 'ui-overlay'

export const SimpleNominate = () => {
	const { t } = useTranslation('pages')
	const { network } = useNetwork()
	const { serviceApi } = useApi()
	const { getTxSubmission } = useTxMeta()
	const { newBatchCall } = useBatchCall()
	const { activeProxy } = useActiveProxy()
	const { closeModal } = useOverlay().modal
	const { accountHasSigner } = useImportedAccounts()
	const { activeAddress, activeAccount } = useActiveAccount()
	const { getNominatorSetup, removeNominatorSetup } = useNominatorSetups()
	const { units } = getStakingChainData(network)

	// Whether the active account (or its active proxy) can actually sign. Used to
	// gate the submit button so read-only accounts cannot attempt to submit
	const hasSigner =
		accountHasSigner(activeAccount) || accountHasSigner(activeProxy)

	// Take optimal nominations from setup progress
	const setup = getNominatorSetup(activeAddress)
	const { progress } = setup
	const { nominations } = progress

	// Track whether bond is valid
	const [bondValid, setBondValid] = useState(false)

	// Bond amount for nominating
	const [bond, setBond] = useState('')
	const bondPlanck = unitToPlanck(bond || '0', units)
	const formValid = bondValid && hasSigner && bondPlanck > 0n

	useEffect(() => {
		setBond('')
		setBondValid(false)
	}, [activeAddress])

	const getTxs = () => {
		if (!activeAddress || !formValid) {
			return
		}
		// Default destination to 'Stash' to receive rewards as free balance to the stash account
		const payee: PalletStakingRewardDestination = {
			type: 'Stash',
		}

		const nominationsParam = nominations.map(
			({ address }: { address: string }) => address,
		)
		const tx = serviceApi.tx.newNominator(bondPlanck, payee, nominationsParam)

		if (!tx) {
			return
		}
		return newBatchCall(tx, activeAddress, activeProxy)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tag: 'nominatorSetup',
		tx: getTxs(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: formValid,
		callbackInBlock: () => {
			// Close the modal after the extrinsic is included in a block
			closeModal()
			// Reset setup progress
			removeNominatorSetup(activeAddress)
		},
	})

	const fee = getTxSubmission(submitExtrinsic.uid)?.fee ?? 0n

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('becomeNominator', { ns: 'modals' })}</Title>
				{!hasSigner && <Warning text={t('readOnly')} />}

				<Separator transparent />
				<BondFeedback
					value={bond}
					onChange={setBond}
					bondFor="nominator"
					listenIsValid={setBondValid}
					txFees={fee}
					maxWidth
				/>
			</Padding>
			<div>
				<SubmitTx
					displayFor="card"
					submitText={t('startNominating')}
					valid={formValid}
					{...submitExtrinsic}
					stacked
				/>
			</div>
		</>
	)
}
