// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useActiveAccount, useImportedAccounts } from '@polkadot-cloud/connect'
import { setActiveProxy } from '@polkadot-cloud/connect-proxies'
import LedgerSVG from '@w3ux/extension-assets/LedgerSquare.svg?react'
import PolkadotVaultSVG from '@w3ux/extension-assets/PolkadotVault.svg?react'
import { ExtensionIcons } from '@w3ux/extension-assets/util'
import WalletConnectSVG from '@w3ux/extension-assets/WalletConnect.svg?react'
import { Polkicon } from '@w3ux/react-polkicon'
import { ellipsisFn, planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useActiveProxy } from 'hooks/useActiveProxy'
import { useNetwork } from 'hooks/useNetwork'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import type { AccountButtonProps } from './types'
import { AccountWrapper } from './Wrappers'

export const AccountButton = ({
	label,
	address,
	source,
	delegator,
	proxyType,
	noBorder = false,
	transferableBalance,
}: AccountButtonProps) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { getAccount } = useImportedAccounts()
	const { closeModal } = useOverlay().modal
	const { activeAccount, activeAddress, setActiveAccount } = useActiveAccount()
	const { activeProxy, activeProxyType } = useActiveProxy()
	const { unit, units } = getStakingChainData(network)

	// Accumulate account data.
	const meta = getAccount({ address, source })
	const name = meta?.name

	const imported = !!meta
	const connectTo = delegator || address
	const connectProxy = delegator ? address : ''

	// Determine account source icon.
	const Icon =
		meta?.source === 'ledger'
			? LedgerSVG
			: meta?.source === 'vault'
				? PolkadotVaultSVG
				: meta?.source === 'wallet_connect'
					? WalletConnectSVG
					: ExtensionIcons[meta?.source || ''] || undefined

	// Determine if this account is active (active account or proxy)
	const isActiveAccount =
		connectTo === activeAddress &&
		address === activeAddress &&
		source === activeAccount?.source &&
		!activeProxy

	const isActiveProxy =
		!!activeProxy?.address &&
		connectProxy === activeProxy.address &&
		proxyType === activeProxyType

	const isActive = isActiveAccount || isActiveProxy

	// Handle account click. Handles both active account and active proxy
	const handleClick = () => {
		if (!imported) {
			return
		}

		const account = getAccount({ address: connectTo, source })
		setActiveAccount(
			account ? { address: account.address, source: account.source } : null,
		)
		setActiveProxy(
			network,
			proxyType && connectProxy
				? { address: connectProxy, source, proxyType }
				: null,
		)
		closeModal()
	}

	return (
		<AccountWrapper className={isActive ? 'active' : undefined}>
			<div className={noBorder ? 'noBorder' : undefined}>
				<section className="head">
					<button
						type="button"
						onClick={() => handleClick()}
						disabled={!imported}
					>
						{delegator && (
							<div className="delegator" style={{ maxWidth: '1.9rem' }}>
								<div>
									<Polkicon address={delegator} fontSize="1.9rem" />
								</div>
							</div>
						)}
						<div className="identicon" style={{ maxWidth: '1.9rem' }}>
							<Polkicon address={address} fontSize="1.9rem" />
						</div>
						<span className="name">
							{delegator && (
								<span>
									{proxyType} {t('proxy')}
								</span>
							)}
							{!name || name === '' ? ellipsisFn(address) : name}
						</span>
						{meta?.source === 'external' && (
							<div
								className="label warning"
								style={{
									color: 'var(--status-warning)',
									paddingLeft: '0.5rem',
								}}
							>
								{t('readOnly')}
							</div>
						)}
						<div className={label === undefined ? `` : label[0]}>
							{label !== undefined ? <h5>{label[1]}</h5> : null}
							{Icon !== undefined ? (
								<span className="icon">
									<Icon />
								</span>
							) : null}

							{meta?.source === 'external' && (
								<FontAwesomeIcon
									icon={faGlasses}
									className="icon"
									style={{ opacity: 0.7 }}
								/>
							)}
						</div>
					</button>
				</section>
				<section className="foot">
					<span className="balance">
						{`${t('free')}: ${new BigNumber(
							planckToUnit(transferableBalance || 0n, units),
						)
							.decimalPlaces(3)
							.toFormat()} ${unit}`}
					</span>
				</section>
			</div>
		</AccountWrapper>
	)
}
