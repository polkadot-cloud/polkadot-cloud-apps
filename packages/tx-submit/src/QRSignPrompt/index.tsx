// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	QrDisplayPayload,
	QrScanSignature,
	type VaultSignatureResult,
	type VaultSignStatus,
} from '@polkadot-cloud/connect-vault'
import { hexToU8a } from 'dedot/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrompt } from 'ui-overlay'
import classes from './index.module.scss'

export interface QRSignPromptProps {
	submitAddress: string
	toSign: Uint8Array
	genesisHash: string
	onComplete: (status: VaultSignStatus, result: VaultSignatureResult) => void
}

export const QRSignPrompt = ({
	submitAddress,
	toSign,
	genesisHash,
	onComplete,
}: QRSignPromptProps) => {
	const { t } = useTranslation('app')
	const { setOnClosePrompt } = usePrompt()
	const [stage, setStage] = useState<number>(1)

	return (
		<div className={classes.wrapper}>
			<h3 className={classes.title}>
				{stage === 1 ? t('scanPolkadotVault') : t('signPolkadotVault')}
			</h3>

			<div className={classes.progress}>
				<span className={stage === 1 ? classes.active : undefined}>Scan</span>
				<span aria-hidden>&gt;</span>
				<span className={stage === 2 ? classes.active : undefined}>Sign</span>
			</div>

			{stage === 1 && (
				<div className={`${classes.viewer} ${classes.withBorder}`}>
					<QrDisplayPayload
						address={submitAddress}
						cmd={2}
						genesisHash={hexToU8a(genesisHash)}
						payload={toSign}
						style={{ width: '100%', maxWidth: 250 }}
					/>
				</div>
			)}
			{stage === 2 && (
				<div className={classes.viewer}>
					<QrScanSignature
						size={279}
						onScan={({ signature }) => {
							onComplete('complete', signature)
						}}
						onCleanup={setOnClosePrompt}
					/>
				</div>
			)}

			<div className={classes.foot}>
				<div className={classes.actions}>
					{stage === 2 && (
						<button
							type="button"
							className={`${classes.button} ${classes.secondary}`}
							onClick={() => setStage(1)}
						>
							{t('backToScan')}
						</button>
					)}
					{stage === 1 && (
						<button
							type="button"
							className={`${classes.button} ${classes.primary}`}
							onClick={() => setStage(2)}
						>
							{t('iHaveScanned')}
						</button>
					)}
					<button
						type="button"
						className={`${classes.button} ${classes.secondary}`}
						onClick={() => {
							onComplete('cancelled', null)
						}}
					>
						{t('cancel')}
					</button>
				</div>
			</div>
		</div>
	)
}
