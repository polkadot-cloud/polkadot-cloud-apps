// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTheme } from 'hooks/useTheme'
import { NominationHealthSetting } from 'library/ManageNominations/NominationHealthSetting'
import { useTranslation } from 'react-i18next'
import { CanvasHeaderControl } from 'ui-core/canvas'
import { ConnectItem, Popover } from 'ui-core/popover'

export const Settings = () => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const { retainmentStatsEnabled } = useNominationHealth()

	if (!retainmentStatsEnabled) {
		return null
	}

	return (
		<CanvasHeaderControl right="4.5rem">
			<Popover
				align="end"
				content={
					<ConnectItem.Container>
						<h4 style={{ background: 'transparent' }}>
							{t('settings', { ns: 'modals' })}
						</h4>
						<NominationHealthSetting />
					</ConnectItem.Container>
				}
				portalContainer={themeElementRef.current || undefined}
				shadow={false}
				side="bottom"
				sideOffset={8}
				triggerLabel={t('settings', { ns: 'modals' })}
				width="min(300px, calc(100vw - 2rem))"
			>
				<FontAwesomeIcon aria-hidden icon={faCog} />
			</Popover>
		</CanvasHeaderControl>
	)
}
