// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { HeaderButton } from 'ui-core/list'

interface RetainmentHistoryProps {
	disabled: boolean
	onClick: () => void
}

export const RetainmentHistory = ({
	disabled,
	onClick,
}: RetainmentHistoryProps) => {
	const { t } = useTranslation('app')

	return (
		<HeaderButton withText>
			<button
				aria-haspopup="dialog"
				disabled={disabled}
				onClick={onClick}
				style={{ gap: '0.4rem' }}
				type="button"
			>
				<FontAwesomeIcon
					aria-hidden="true"
					icon={faClockRotateLeft}
					transform="shrink-3"
				/>
				{t('retainment')}
			</button>
		</HeaderButton>
	)
}
