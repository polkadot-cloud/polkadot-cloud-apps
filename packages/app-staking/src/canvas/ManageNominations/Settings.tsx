// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleCheck,
	faCog,
	faToggleOff,
	faToggleOn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNominationHealth } from 'hooks/useNominationHealth'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CanvasHeaderControl } from 'ui-core/canvas'
import { ConnectItem, MenuItem, MenuItemButton, Popover } from 'ui-core/popover'

export const Settings = () => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const { enabled, setEnabled, stakingApiEnabled } = useNominationHealth()
	const [open, setOpen] = useState(false)

	if (!stakingApiEnabled) {
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
										color={
											enabled ? 'var(--gray-1000)' : 'var(--text-tertiary)'
										}
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
					</ConnectItem.Container>
				}
				onOpenChange={setOpen}
				open={open}
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
