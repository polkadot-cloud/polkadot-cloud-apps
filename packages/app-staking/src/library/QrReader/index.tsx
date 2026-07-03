// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	QrScanSignature,
	useVaultAccounts,
} from '@polkadot-cloud/connect-vault'
import { formatAccountSs58, isValidAddress } from '@w3ux/util-dedot'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { QrReaderProps } from './types'
import { Wrapper } from './Wrapper'

export const QrReader = ({ network, ss58, onSuccess }: QrReaderProps) => {
	const { t } = useTranslation('modals')
	const { addVaultAccount, vaultAccountExists, getVaultAccounts } =
		useVaultAccounts(network)

	const vaultAccounts = getVaultAccounts()

	// Store data from QR Code scanner.
	const [qrData, setQrData] = useState<string | undefined>(undefined)

	// Handle a newly received QR signature.
	const handleQrData = (signature: string) => {
		setQrData(signature.split(':')?.[1] || '')
	}

	const valid =
		qrData &&
		isValidAddress(qrData) &&
		!vaultAccountExists(qrData) &&
		formatAccountSs58(qrData, ss58) !== null

	useEffect(() => {
		// Add account and close overlay if valid.
		if (valid) {
			const account = addVaultAccount(1, qrData, vaultAccounts.length)
			if (account) {
				onSuccess(account)
			}
		}
	})

	// Display feedback.
	const feedback =
		qrData === undefined
			? `${t('waitingForQRCode')}`
			: isValidAddress(qrData)
				? formatAccountSs58(qrData, ss58) !== qrData
					? `${t('differentNetworkAddress')}`
					: vaultAccountExists(qrData)
						? `${t('accountAlreadyImported')}`
						: `${t('addressReceived')}`
				: `${t('invalidAddress')}`

	return (
		<Wrapper>
			<div className="qrRegion">
				<QrScanSignature
					size={250}
					onScan={({ signature }) => handleQrData(signature)}
				/>
			</div>
			<h3>
				{feedback}
				{qrData === undefined && <div></div>}
			</h3>
		</Wrapper>
	)
}
