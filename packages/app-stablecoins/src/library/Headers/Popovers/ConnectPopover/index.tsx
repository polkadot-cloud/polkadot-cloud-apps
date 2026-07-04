// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useExtensions } from '@polkadot-cloud/connect'
import extensions from '@w3ux/extension-assets'
import { useOutsideAlerter } from '@w3ux/hooks'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverTab } from 'ui-buttons'
import { ConnectItem } from 'ui-core/popover'
import { ReadOnly } from './ReadOnly'
import type { SetOpenProp } from './types'
import { mobileCheck } from './Utils'
import { Wallets } from './Wallets'

export const ConnectPopover = ({ setOpen }: SetOpenProp) => {
	const { t } = useTranslation()
	const { extensionsStatus } = useExtensions()
	const [selectedSection, setSelectedConnectItem] = useState<string>('wallets')
	const popoverRef = useRef<HTMLDivElement>(null)
	const isMobile = mobileCheck()
	const inNova = !!window?.walletExtension?.isNovaWallet || false
	const inSubWallet = !!window.injectedWeb3?.['subwallet-js'] && isMobile
	const deprecated = ['snap', 'polkagate', 'fearless']
	const extensionsAsArray = Object.entries(extensions)
		.map(([key, value]) => ({
			id: key,
			...value,
		}))
		.filter(({ id }) => !deprecated.some((d) => id.includes(d)))

	const web = inSubWallet
		? extensionsAsArray.filter((a) => a.id === 'subwallet-js')
		: inNova
			? extensionsAsArray
					.filter((a) => a.id === 'nova-wallet')
					.map((a) => ({ ...a, id: 'polkadot-js' }))
			: extensionsAsArray.filter((a) => a.category === 'web-extension')

	const installed = web.filter((a) => a.id in extensionsStatus)
	installed.sort((a, b) =>
		a.id === 'enkrypt' ? 1 : b.id === 'enkrypt' ? -1 : 0,
	)
	const installedIds = new Set(installed.map((a) => a.id))
	const other = web.filter((a) => !installedIds.has(a.id))

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
			<motion.section {...getManageProps('readOnly', 'hidden')}>
				<ReadOnly setOpen={setOpen} />
			</motion.section>
		</div>
	)
}
