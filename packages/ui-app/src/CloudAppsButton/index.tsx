// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import classNames from 'classnames'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'
import classes from './index.module.scss'

export const CloudAppsButton = ({
	children,
	className,
	onOpen,
}: {
	children: ReactNode
	className?: string
	onOpen?: () => void
}) => {
	const { t } = useTranslation('modals')
	const { openModal } = useOverlay().modal

	return (
		<button
			type="button"
			className={classNames(classes.trigger, className)}
			aria-label={t('cloudApps.title')}
			aria-haspopup="dialog"
			onClick={() => {
				onOpen?.()
				openModal({ key: 'CloudApps', size: 'xl' })
			}}
		>
			{children}
		</button>
	)
}
