// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import {
	faPlugCircleExclamation,
	faPlugCircleXmark,
	faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useExtensionAccounts, useExtensions } from '@polkadot-cloud/connect'
import { ExtensionIcons } from '@w3ux/extension-assets/util'
import { localStorageOrDefault } from '@w3ux/utils'
import { useNetwork } from 'contexts/Network'
import { onExtensionConnectedEvent } from 'event-tracking'
import { useTranslation } from 'react-i18next'
import { ButtonMonoInvert } from 'ui-buttons'
import { ConnectItem } from 'ui-core/popover'
import { useOverlay } from 'ui-overlay'
import type { ExtensionProps } from './types'

export const Extension = ({ extension, last, setOpen }: ExtensionProps) => {
	const { t } = useTranslation('modals')
	const { network } = useNetwork()
	const { openModal } = useOverlay().modal
	const { connectExtension } = useExtensionAccounts()
	const { extensionsStatus, extensionCanConnect, extensionInstalled } =
		useExtensions()

	const { id, title, website } = extension
	const isInstalled = extensionInstalled(id)
	const canConnect = extensionCanConnect(id)
	const connected = extensionsStatus[id] === 'connected'
	const iconId =
		window?.walletExtension?.isNovaWallet && id === 'polkadot-js'
			? 'nova-wallet'
			: id
	const Icon = ExtensionIcons[iconId]
	const disabled = !isInstalled

	const handleClick = async () => {
		if (!connected) {
			if (canConnect) {
				await connectExtension(id)
				onExtensionConnectedEvent(network, id)
				setOpen(false)
				openModal({ key: 'Accounts' })
			} else {
				alert('Unable to connect to the extension.')
			}
		} else if (confirm(t('disconnectFromExtension'))) {
			const updatedAtiveExtensions = (
				localStorageOrDefault('active_extensions', [], true) as string[]
			).filter((ext: string) => ext !== id)

			localStorage.setItem(
				'active_extensions',
				JSON.stringify(updatedAtiveExtensions),
			)
			location.reload()
		}
	}

	let faIcon: IconDefinition
	switch (extensionsStatus[id]) {
		case 'not_authenticated':
			faIcon = faPlugCircleExclamation
			break
		default:
			faIcon = faPlus
	}

	return (
		<ConnectItem.Item last={last}>
			<div>
				<ConnectItem.Logo Svg={Icon} />
			</div>
			<div>
				<div>
					<h3 className={`${connected ? ` connected` : ``}`}>{title}</h3>
					<ConnectItem.WebUrl url={`https://${website}`} text={website} />
				</div>
				<div>
					<ButtonMonoInvert
						style={connected ? { color: 'var(--status-danger)' } : undefined}
						text={
							connected
								? t('disconnect', { ns: 'modals' })
								: isInstalled
									? t('connect', { ns: 'modals' })
									: t('notInstalled', { ns: 'modals' })
						}
						onClick={() => handleClick()}
						iconRight={
							connected ? undefined : isInstalled ? faIcon : faPlugCircleXmark
						}
						disabled={disabled}
					/>
				</div>
			</div>
		</ConnectItem.Item>
	)
}
