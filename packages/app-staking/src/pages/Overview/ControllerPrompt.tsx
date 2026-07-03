// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { WarningPrompt } from 'library/WarningPrompt'
import { useTranslation } from 'react-i18next'
import { useOverlay } from 'ui-overlay'

export const ControllerPrompt = () => {
	const { t } = useTranslation('app')
	const { openModal } = useOverlay().modal

	return (
		<WarningPrompt
			title={t('migrationRequired')}
			subtitle={t('migrateControllerDescription')}
			buttonText={t('migrateController')}
			onClick={() => openModal({ key: 'SetController' })}
		/>
	)
}
