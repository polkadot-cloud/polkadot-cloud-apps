// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleCheck,
	faToggleOff,
	faToggleOn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTranslation } from 'react-i18next'
import { MenuItem, MenuItemButton } from 'ui-core/popover'

export const NominationHealthSetting = () => {
	const { t } = useTranslation('app')
	const { enabled, retainmentStatsEnabled, setEnabled } = useNominationHealth()

	if (!retainmentStatsEnabled) {
		return null
	}

	return (
		<>
			<MenuItemButton onClick={() => setEnabled((current) => !current)}>
				<div>
					<FontAwesomeIcon icon={faCircleCheck} transform="shrink-1" />
				</div>
				<div>
					<h3>{t('nominationHealthCheck')}</h3>
				</div>
				<div>
					<div>
						<FontAwesomeIcon
							color={enabled ? 'var(--gray-1000)' : 'var(--text-tertiary)'}
							icon={enabled ? faToggleOn : faToggleOff}
							transform="grow-8"
						/>
					</div>
				</div>
			</MenuItemButton>
			<MenuItem padded>
				<p role="note" style={{ margin: 0 }}>
					{t('nominationHealthCheckDisableWarning')}
				</p>
			</MenuItem>
		</>
	)
}
