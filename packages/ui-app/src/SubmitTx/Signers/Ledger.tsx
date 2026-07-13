// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useImportedAccounts } from '@polkadot-cloud/connect'
import {
	useLedgerTxPrompt,
	useLedgerTxSubmit,
} from '@polkadot-cloud/connect-ledger'
import { useHelp } from 'hooks/useHelp'
import { useTranslation } from 'react-i18next'
import type { ActiveAccount, DisplayFor, TxFeeDisplay } from 'types'
import { ButtonHelp, ButtonSubmitWithFee } from 'ui-buttons'
import { useOverlay } from 'ui-overlay'
import { EstimatedTxFee } from '../../EstimatedTxFee'
import { SubmitButtonWrapper } from '../../Tx'

interface LedgerProps {
	uid: number
	displayFor?: DisplayFor
	valid: boolean
	submitted: boolean
	submitText?: string
	submitAccount: ActiveAccount
	onSubmit: () => void
	notEnoughFunds: boolean
	feeDisplay: TxFeeDisplay
}

interface LedgerPromptProps {
	valid: boolean
}

export const LedgerSubmit = ({
	uid,
	valid,
	submitted,
	submitText,
	submitAccount,
	onSubmit,
	notEnoughFunds,
	feeDisplay,
}: LedgerProps) => {
	const { t } = useTranslation('app')
	const { setModalResize } = useOverlay().modal
	const { accountHasSigner } = useImportedAccounts()

	const { buttonText, buttonIcon, buttonOnClick, buttonDisabled, buttonPulse } =
		useLedgerTxSubmit({
			uid,
			submitted,
			valid,
			submitText,
			submitAccount,
			onSubmit,
			notEnoughFunds,
			setModalResize,
			accountHasSigner,
		})

	// Translate button text codes from ledger-connect
	const translatedButtonText = buttonText ? t(buttonText) : ''

	return (
		<SubmitButtonWrapper>
			<ButtonSubmitWithFee
				submitText={translatedButtonText}
				icon={buttonIcon}
				iconTransform="shrink-3"
				onSubmit={buttonOnClick}
				disabled={buttonDisabled}
				pulse={buttonPulse}
				fee={<EstimatedTxFee uid={uid} feeDisplay={feeDisplay} />}
			/>
		</SubmitButtonWrapper>
	)
}

export const LedgerPrompt = ({ valid }: LedgerPromptProps) => {
	const { t } = useTranslation('app')
	const { openHelpTooltip } = useHelp()
	const { feedback, messageCode, messageParams, verified } = useLedgerTxPrompt()

	if (!valid) {
		return <p className="prompt">...</p>
	}

	// Translate message codes from ledger-connect
	const message = verified
		? `${t('deviceVerified')}. ${t(messageCode, messageParams)}`
		: t(messageCode, messageParams)

	return (
		<p className="prompt">
			<FontAwesomeIcon icon={faCircleExclamation} className="icon" />
			{message}
			{feedback?.helpKey && (
				<ButtonHelp
					marginLeft
					definition={feedback?.helpKey}
					openHelp={openHelpTooltip}
				/>
			)}
		</p>
	)
}
