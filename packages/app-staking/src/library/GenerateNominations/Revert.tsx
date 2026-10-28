// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { ButtonSecondary } from 'ui-buttons'
import { ConfirmAction } from './ConfirmAction'
import type { RevertProps } from './types'

export const Revert = ({ disabled, onClick }: RevertProps) => {
	const { t } = useTranslation('modals')

	return (
		<ConfirmAction
			controlKey="revert_nominations"
			disabled={disabled}
			onConfirm={onClick}
			text={t('revertNominationChanges')}
		>
			<ButtonSecondary
				asLabel
				className="revert"
				size="lg"
				text={t('revertChanges')}
				disabled={disabled}
			/>
		</ConfirmAction>
	)
}
