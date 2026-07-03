// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deriveVaultButtonState } from '@polkadot-cloud/connect-vault'
import { EstimatedTxFee } from 'library/EstimatedTxFee'
import { SubmitButton } from 'library/SubmitTx/Signers/SubmitButton'
import { SubmitButtonWrapper } from 'library/Tx/Wrapper'
import { useTranslation } from 'react-i18next'
import type { DisplayFor } from 'types'

interface VaultProps {
	uid: number
	displayFor?: DisplayFor
	valid: boolean
	submitted: boolean
	submitText?: string
	onSubmit: () => void
	notEnoughFunds: boolean
	promptStatus: number
}

export const VaultSubmit = ({
	uid,
	displayFor,
	valid,
	submitted,
	submitText,
	onSubmit,
	notEnoughFunds,
	promptStatus,
}: VaultProps) => {
	const { t } = useTranslation('app')

	const disabled = submitted || !valid || notEnoughFunds
	const { buttonText, buttonDisabled, buttonPulse } = deriveVaultButtonState({
		submitted,
		valid,
		submitText: submitText || '',
		signText: submitText || t('sign'),
		promptStatus,
		disabled,
	})

	// For card displayFor, override disabled/pulse logic
	const isCard = displayFor === 'card'
	const finalDisabled = isCard ? disabled : buttonDisabled
	const finalPulse = isCard ? !finalDisabled : buttonPulse

	return (
		<SubmitButtonWrapper>
			<SubmitButton
				text={buttonText}
				iconTransform="shrink-4"
				onSubmit={onSubmit}
				disabled={finalDisabled}
				pulse={finalPulse}
				fee={<EstimatedTxFee uid={uid} />}
			/>
		</SubmitButtonWrapper>
	)
}

export const VaultPrompt = ({ valid }: { valid: boolean }) => {
	const { t } = useTranslation('app')
	return (
		<>
			{valid ? (
				<p className="prompt">
					<FontAwesomeIcon icon={faCircleExclamation} className="icon" />
					{t('submitTransaction')}
				</p>
			) : (
				<p className="prompt">...</p>
			)}
		</>
	)
}
