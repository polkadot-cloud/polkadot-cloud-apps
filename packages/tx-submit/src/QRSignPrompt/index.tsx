// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	QrDisplayPayload,
	QrScanSignature,
	type VaultSignatureResult,
	type VaultSignStatus,
} from '@polkadot-cloud/connect-vault'
import { hexToU8a } from 'dedot/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary, ButtonSecondary } from 'ui-buttons'
import { usePrompt } from 'ui-overlay'
import { Wrapper } from './Wrapper'

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

	// Whether user is on sign or submit stage
	const [stage, setStage] = useState<number>(1)

	return (
		<Wrapper>
			{stage === 1 && <h3 className="title">{t('scanPolkadotVault')}</h3>}
			{stage === 2 && <h3 className="title">{t('signPolkadotVault')}</h3>}

			<div className="progress">
				<span className={stage === 1 ? 'active' : undefined}>Scan</span>
				<FontAwesomeIcon
					icon={faChevronRight}
					transform="shrink-4"
					className="arrow"
				/>
				<span className={stage === 2 ? 'active' : undefined}>Sign</span>
			</div>
			{stage === 1 && (
				<div className="viewer withBorder">
					<QrDisplayPayload
						address={submitAddress || ''}
						cmd={2}
						genesisHash={hexToU8a(genesisHash)}
						payload={toSign}
						style={{ width: '100%', maxWidth: 250 }}
					/>
				</div>
			)}
			{stage === 2 && (
				<div className="viewer">
					<QrScanSignature
						size={279}
						onScan={({ signature }) => {
							onComplete('complete', signature)
						}}
						onCleanup={setOnClosePrompt}
					/>
				</div>
			)}
			<div className="foot">
				<div>
					{stage === 2 && (
						<ButtonSecondary
							text={t('backToScan')}
							size="lg"
							onClick={() => setStage(1)}
							iconLeft={faChevronLeft}
							iconTransform="shrink-3"
						/>
					)}
					{stage === 1 && (
						<ButtonPrimary
							text={t('iHaveScanned')}
							size="lg"
							onClick={() => {
								setStage(2)
							}}
							iconRight={faChevronRight}
							iconTransform="shrink-3"
						/>
					)}
					<ButtonSecondary
						text={t('cancel')}
						size="lg"
						marginLeft
						onClick={() => {
							onComplete('cancelled', null)
						}}
					/>
				</div>
			</div>
		</Wrapper>
	)
}
