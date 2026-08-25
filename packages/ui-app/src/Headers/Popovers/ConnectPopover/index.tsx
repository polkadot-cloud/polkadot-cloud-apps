// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useExtensions } from '@polkadot-cloud/connect'
import { useOutsideAlerter } from '@w3ux/hooks'
import extensions from 'consts/extensions'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { ConnectItem } from 'ui-core/popover'
import { Proxies } from './Proxies'
import { ReadOnly } from './ReadOnly'
import type { SetOpenProp } from './types'
import { Wallets } from './Wallets'

export const ConnectPopover = ({ setOpen }: SetOpenProp) => {
	const { t } = useTranslation()
	const { extensionsStatus } = useExtensions()

	// Store the active hardware wallet, if selected.
	const [selectedSection, setSelectedConnectItem] = useState<string>('wallets')

	const popoverRef = useRef<HTMLDivElement>(null)

	// Format supported extensions as array
	const extensionsAsArray = Object.entries(extensions).map(([id, value]) => ({
		id,
		...value,
	}))

	// Determine which web extensions to display.
	const web = extensionsAsArray.filter((a) => a.category === 'web-extension')

	const installed = web.filter((a) => a.id in extensionsStatus)

	const installedIds = new Set(installed.map((a) => a.id))
	const other = web.filter((a) => !installedIds.has(a.id))

	// Close the menu if clicked outside of its container
	useOutsideAlerter(popoverRef, () => {
		setOpen(false)
	}, ['header-connect'])

	const variants = {
		hidden: {
			height: 0,
		},
		show: {
			height: 'auto',
		},
	}

	// Gets framer motion props for a management ui item
	const getManageProps = (item: string, initial: 'show' | 'hidden') => ({
		initial,
		variants,
		transition: {
			duration: 0.2,
		},
		animate: selectedSection === item ? 'show' : 'hidden',
		className: 'motion',
		style: {
			overflow: 'hidden',
		},
	})

	return (
		<div ref={popoverRef} style={{ overflow: 'hidden' }}>
			<PopoverTab.Container position="top">
				<PopoverTab.Button
					text={t('wallets', { ns: 'app' })}
					onClick={() => setSelectedConnectItem('wallets')}
				/>
				<PopoverTab.Button
					text={t('proxies', { ns: 'modals' })}
					onClick={() => setSelectedConnectItem('proxies')}
				/>
				<PopoverTab.Button
					text={t('readOnly', { ns: 'modals' })}
					onClick={() => setSelectedConnectItem('readOnly')}
				/>
			</PopoverTab.Container>
			<motion.section {...getManageProps('wallets', 'show')}>
				<ConnectItem.Container>
					<Wallets
						installed={installed}
						other={other}
						selectedSection={selectedSection}
						setOpen={setOpen}
					/>
				</ConnectItem.Container>
			</motion.section>
			<motion.section {...getManageProps('proxies', 'hidden')}>
				<Proxies setOpen={setOpen} />
			</motion.section>
			<motion.section {...getManageProps('readOnly', 'hidden')}>
				<ReadOnly setOpen={setOpen} />
			</motion.section>
		</div>
	)
}
