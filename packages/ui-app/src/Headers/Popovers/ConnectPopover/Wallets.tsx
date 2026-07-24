// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import LedgerSquareSVG from '@w3ux/extension-assets/LedgerSquare.svg?react'
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import { Extension } from './Extension'
import { Hardware } from './Hardware'
import type { WalletProps } from './types'

export const Wallets = ({
	installed,
	other,
	setOpen,
	selectedSection,
}: WalletProps) => {
	const { t } = useTranslation()
	const { openModal } = useOverlay().modal

	const extensionItems = installed.concat(other)

	const devTools = extensionItems.filter((ext) => ext.id === 'polkadot-js')
	const otherExtensions = extensionItems.filter(
		(ext) => ext.id !== 'polkadot-js',
	)

	return (
		<>
			<h4>{t('hardware', { ns: 'modals' })}</h4>
			<section>
				<Hardware
					active={selectedSection === 'polkadot_vault'}
					onClick={() => {
						openModal({
							key: 'ImportAccounts',
							size: 'sm',
							options: { source: 'polkadot_vault' },
						})
						setOpen(false)
					}}
					Svg={PolkadotVaultSVG}
					title="Polkadot Vault"
					websiteUrl="https://vault.novasama.io"
					websiteText="vault.novasama.io"
				/>
			</section>
			<section>
				<Hardware
					active={selectedSection === 'ledger'}
					onClick={() => {
						openModal({
							key: 'ImportAccounts',
							size: 'sm',
							options: { source: 'ledger' },
						})
						setOpen(false)
					}}
					Svg={LedgerSquareSVG}
					title="Ledger"
					websiteUrl="https://ledger.com"
					websiteText="ledger.com"
					last
				/>
			</section>
			<h4>{t('webExtensions', { ns: 'app' })}</h4>
			{otherExtensions.map((extension, i) => (
				<section key={`extension_item_${extension.id}`}>
					<Extension
						extension={extension}
						last={i === otherExtensions.length - 1}
						setOpen={setOpen}
					/>
				</section>
			))}
			<h4>{t('developerTools', { ns: 'modals' })}</h4>
			{devTools.map((extension, i) => (
				<section key={`extension_item_${extension.id}`}>
					<Extension
						extension={extension}
						last={i === devTools.length - 1}
						setOpen={setOpen}
					/>
				</section>
			))}
		</>
	)
}
