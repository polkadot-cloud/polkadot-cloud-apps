// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DisplayFor, TxFeeDisplay } from 'types'
import { ButtonSubmitWithFee } from 'ui-buttons'
import { EstimatedTxFee } from '../../EstimatedTxFee'
import { SubmitButtonWrapper } from '../../Tx'

interface ExtensionProps {
	uid: number
	displayFor?: DisplayFor
	submitText: string
	onSubmit: () => void
	valid: boolean
	submitted: boolean
	notEnoughFunds: boolean
	feeDisplay: TxFeeDisplay
}

export const Extension = ({
	uid,
	submitText,
	onSubmit,
	valid,
	submitted,
	notEnoughFunds,
	feeDisplay,
}: ExtensionProps) => {
	// Disable while submitting or when the account cannot cover the tx fee,
	// matching the Vault and Ledger signers
	const buttonDisabled = submitted || !valid || notEnoughFunds

	return (
		<SubmitButtonWrapper>
			<ButtonSubmitWithFee
				submitText={submitText}
				onSubmit={onSubmit}
				disabled={buttonDisabled}
				pulse={!buttonDisabled}
				fee={<EstimatedTxFee uid={uid} feeDisplay={feeDisplay} />}
			/>
		</SubmitButtonWrapper>
	)
}
