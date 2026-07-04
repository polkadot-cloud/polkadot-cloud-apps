// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { EstimatedTxFee } from 'library/EstimatedTxFee'
import { SubmitButtonWrapper } from 'library/Tx/Wrapper'
import type { DisplayFor } from 'types'
import { ButtonSubmitWithFee } from 'ui-buttons'

interface ExtensionProps {
	uid: number
	displayFor?: DisplayFor
	submitText: string
	onSubmit: () => void
	valid: boolean
	submitted: boolean
	notEnoughFunds: boolean
}

export const Extension = ({
	uid,
	submitText,
	onSubmit,
	valid,
	submitted,
	notEnoughFunds,
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
				fee={<EstimatedTxFee uid={uid} />}
			/>
		</SubmitButtonWrapper>
	)
}
