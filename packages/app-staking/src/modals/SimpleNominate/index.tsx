// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { planckToUnit, unitToPlanck } from '@w3ux/utils'
import type BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useNominatorSetups } from 'contexts/NominatorSetups'
import type { PalletStakingRewardDestination } from 'dedot/chaintypes'
import { useAccountBalances } from 'hooks/useAccountBalances'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useApi } from 'hooks/useApi'
import { useBatchCall } from 'hooks/useBatchCall'
import { useNetwork } from 'hooks/useNetwork'
import { useSubmitExtrinsic } from 'hooks/useSubmitExtrinsic'
import { formatFromProp } from 'hooks/useSubmitExtrinsic/util'
import { useTxMeta } from 'hooks/useTxMeta'
import { BondFeedback } from 'library/Form/Bond/BondFeedback'
import { Warning } from 'library/Form/Warning'
import { SubmitTx } from 'library/SubmitTx'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
	const {
		balances: {
			nominator: { totalPossibleBond },
		},
	} = useAccountBalances(activeAddress)
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
	const [bondValid, setBondValid] = useState<boolean>(true)

	// Bond amount for nominating
	const [bond, setBond] = useState<string>(
		planckToUnit(totalPossibleBond, units),
	)

	// Handler to set bond on input change
	const handleSetBond = ({ value }: { value: BigNumber }) => {
		setBond(value.toString())
	}

	const getTxs = () => {
		if (!activeAddress) {
			return
		}
		// Default destination to 'Stash' to receive rewards as free balance to the stash account
		const payee: PalletStakingRewardDestination = {
			type: 'Stash',
		}

		const nominationsParam = nominations.map(
			({ address }: { address: string }) => address,
		)
		const tx = serviceApi.tx.newNominator(
			unitToPlanck(bond || '0', units),
			payee,
			nominationsParam,
		)

		if (!tx) {
			return
		}
		return newBatchCall(tx, activeAddress, activeProxy)
	}

	const submitExtrinsic = useSubmitExtrinsic({
		tag: 'nominatorSetup',
		tx: getTxs(),
		from: formatFromProp(activeAccount, activeProxy),
		shouldSubmit: true,
		callbackInBlock: () => {
			// Close the modal after the extrinsic is included in a block
			closeModal()
			// Reset setup progress
			removeNominatorSetup(activeAddress)
		},
	})

	const fee = getTxSubmission(submitExtrinsic.uid)?.fee || 0n

	return (
		<>
			<Close />
			<Padding>
				<Title>{t('becomeNominator', { ns: 'modals' })}</Title>
				{!hasSigner && <Warning text={t('readOnly')} />}

				<Separator transparent />
				<BondFeedback
					syncing={false}
					bondFor="nominator"
					bonding={false}
					listenIsValid={(valid) => setBondValid(valid)}
					defaultBond={null}
					setters={[handleSetBond]}
					txFees={fee}
					maxWidth
				/>
			</Padding>
			<div>
				<SubmitTx
					displayFor="card"
					submitText={t('startNominating')}
					valid={bondValid && hasSigner}
					{...submitExtrinsic}
					stacked
				/>
			</div>
		</>
	)
}
