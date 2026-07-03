// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faChevronLeft,
	faChevronRight,
	faPenToSquare,
	faWarning,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useImportedAccounts } from '@polkadot-cloud/connect'
import { useTranslation } from 'react-i18next'
import type { SignerProps } from './types'
import { ProxySwitcher, SignerWrapper } from './Wrapper'

export const Signer = (props: SignerProps) => {
	const {
		dangerMessage,
		notEnoughFunds,
		proxyAccount,
		proxySupported,
		requiresMigratedController,
		submitAccount,
		onPreviousSigner,
		onNextSigner,
		hasMultipleSigners,
		valid,
		PromptComponent,
		stacked,
	} = props
	const { t } = useTranslation()
	const { getAccount } = useImportedAccounts()

	// Check if current proxy is actually a proxy (has proxyType) or just the from account
	const isUsingProxy = proxyAccount?.proxyType

	// Determine signing options
	let signingOpts = {
		label: t('signer', { ns: 'app' }),
		who: getAccount(submitAccount),
	}

	if (isUsingProxy && proxySupported) {
		signingOpts = {
			label: t('signedByProxy', { ns: 'app' }),
			who: getAccount(proxyAccount),
		}
	} else if (!isUsingProxy && requiresMigratedController) {
		signingOpts = {
			label: t('signedByController', { ns: 'app' }),
			who: getAccount(submitAccount),
		}
	}

	const showBadgeAbove = !PromptComponent && !stacked

	const badge = (
		<span className="badge">
			<FontAwesomeIcon icon={faPenToSquare} className="icon" />
			{signingOpts.label}
		</span>
	)

	const details = (
		<>
			{signingOpts.who?.name || ''}
			{hasMultipleSigners && (
				<ProxySwitcher>
					<button type="button" onClick={onPreviousSigner} disabled={!valid}>
						<FontAwesomeIcon icon={faChevronLeft} transform="shrink-2" />
					</button>
					<button type="button" onClick={onNextSigner} disabled={!valid}>
						<FontAwesomeIcon icon={faChevronRight} transform="shrink-2" />
					</button>
				</ProxySwitcher>
			)}
			{notEnoughFunds && (
				<span className="not-enough">
					/ &nbsp;
					<FontAwesomeIcon
						icon={faWarning}
						className="danger icon"
						transform="shrink-1"
					/>
					<span className="danger">{dangerMessage}</span>
				</span>
			)}
		</>
	)

	if (showBadgeAbove) {
		return (
			<>
				<SignerWrapper className="badge-row">{badge}</SignerWrapper>
				<SignerWrapper>{details}</SignerWrapper>
			</>
		)
	}

	return (
		<SignerWrapper>
			{badge}
			{details}
		</SignerWrapper>
	)
}
