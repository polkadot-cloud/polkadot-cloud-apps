// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SubscanSVG from 'assets/brands/subscan.svg?react'
import { getSubscanBalanceChainId } from 'consts/util'
import { ConnectItem, MenuItemButton } from 'ui-core/popover'
import type { AccountDetailsProps } from './types'

export const AccountDetails = ({
	address,
	network,
	onOpen,
}: AccountDetailsProps) => (
	<>
		<ConnectItem.Container>
			<h4>Account Details</h4>
		</ConnectItem.Container>
		<MenuItemButton
			style={{ border: 'none' }}
			disabled={!address}
			onClick={() => {
				if (!address) {
					return
				}
				onOpen?.()
				window.open(
					`https://${getSubscanBalanceChainId(network)}.subscan.io/account/${encodeURIComponent(address)}`,
					'_blank',
					'noopener,noreferrer',
				)
			}}
		>
			<div>
				<SubscanSVG width="1.5rem" height="1.5rem" />
			</div>
			<div>
				<h3>Subscan</h3>
				<div>
					<FontAwesomeIcon icon={faExternalLinkAlt} transform="shrink-3" />
				</div>
			</div>
		</MenuItemButton>
	</>
)
