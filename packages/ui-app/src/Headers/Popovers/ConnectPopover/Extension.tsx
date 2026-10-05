// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import {
	faPlugCircleExclamation,
	faPlugCircleXmark,
	faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useExtensionAccounts, useExtensions } from '@polkadot-cloud/connect'
import { removeExtensionFromLocal } from '@polkadot-cloud/connect-core'
import { getExtensionIcon } from 'assets'
import { onExtensionConnectedEvent } from 'event-tracking'
import { useNetwork } from 'hooks/useNetwork'
import { useRef, useState } from 'react'
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
	const { extensionsStatus } = useExtensions()

	const { id, title, website } = extension
	const [connecting, setConnecting] = useState(false)
	const connectingRef = useRef(false)

	const isInstalled = extensionsStatus[id] !== undefined
	const connected = extensionsStatus[id] === 'connected'

	const Icon = getExtensionIcon(id)
	const disabled = !isInstalled || connecting

	// Handle connect and disconnect from extension.
	const handleClick = async () => {
		if (connectingRef.current) {
			return
		}
		if (!connected) {
			connectingRef.current = true
			setConnecting(true)
			try {
				if (!(await connectExtension(id))) {
					alert('Unable to connect to the extension.')
					return
				}
				onExtensionConnectedEvent(network, id)
				setOpen(false)
				openModal({ key: 'Accounts' })
			} catch {
				alert('Unable to connect to the extension.')
			} finally {
				connectingRef.current = false
				setConnecting(false)
			}
		} else {
			if (confirm(t('disconnectFromExtension'))) {
				removeExtensionFromLocal(id)
				location.reload()
			}
		}
	}

	// Determine icon to be displayed based on extension status
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
			<div>{Icon && <ConnectItem.Logo Svg={Icon} />}</div>
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
