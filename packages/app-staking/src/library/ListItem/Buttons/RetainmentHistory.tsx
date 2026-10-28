// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { HeaderButton } from 'ui-core/list'
import type { RetainmentHistoryOptions } from 'ui-modals/RetainmentHistory'
import { useOverlay } from 'ui-overlay'

interface RetainmentHistoryProps {
	disabled: boolean
	iconOnly?: boolean
	onClick: () => void
}

export const useOpenRetainmentHistory = (options: RetainmentHistoryOptions) => {
	const { openModal } = useOverlay().modal

	return () => openModal({ key: 'RetainmentHistory', options, size: 'sm' })
}

export const RetainmentHistory = ({
	disabled,
	iconOnly = false,
	onClick,
}: RetainmentHistoryProps) => {
	const { t } = useTranslation('app')
	const historyLabel = t('retainmentHistory')
	const button = (
		<button
			aria-label={historyLabel}
			aria-haspopup="dialog"
			disabled={disabled}
			onClick={onClick}
			style={iconOnly ? undefined : { gap: '0.4rem' }}
			title={historyLabel}
			type="button"
		>
			<FontAwesomeIcon
				aria-hidden="true"
				icon={faClockRotateLeft}
				transform="shrink-3"
			/>
			{!iconOnly && t('retainment')}
		</button>
	)

	return iconOnly ? button : <HeaderButton withText>{button}</HeaderButton>
}
