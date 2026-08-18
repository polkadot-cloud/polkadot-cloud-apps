// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	faCircleCheck,
	faCog,
	faToggleOff,
	faToggleOn,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTheme } from 'hooks/useTheme'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConnectItem, MenuItemButton, Popover } from 'ui-core/popover'
import {
	SettingsControl,
	SettingsTrigger,
	SettingsWarning,
} from './Settings.styles'

export const Settings = ({
	disabled,
	healthCheckEnabled,
	onHealthCheckEnabledChange,
}: {
	disabled: boolean
	healthCheckEnabled: boolean
	onHealthCheckEnabledChange: (enabled: boolean) => void
}) => {
	const { t } = useTranslation('app')
	const { themeElementRef } = useTheme()
	const [open, setOpen] = useState(false)

	return (
		<SettingsControl>
			<Popover
				align="end"
				content={
					<ConnectItem.Container>
						<h4 style={{ background: 'transparent' }}>
							{t('settings', { ns: 'modals' })}
						</h4>
						<MenuItemButton
							disabled={disabled}
							onClick={() => onHealthCheckEnabledChange(!healthCheckEnabled)}
						>
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
											healthCheckEnabled
												? 'var(--gray-1000)'
												: 'var(--text-tertiary)'
										}
										icon={healthCheckEnabled ? faToggleOn : faToggleOff}
										transform="grow-8"
									/>
								</div>
							</div>
						</MenuItemButton>
						<SettingsWarning role="note">
							{t('nominationHealthCheckDisableWarning')}
						</SettingsWarning>
					</ConnectItem.Container>
				}
				onOpenChange={setOpen}
				open={open}
				portalContainer={themeElementRef.current || undefined}
				shadow={false}
				side="bottom"
				sideOffset={8}
				width="min(300px, calc(100vw - 2rem))"
			>
				<SettingsTrigger>
					<FontAwesomeIcon aria-hidden icon={faCog} />
					<span>{t('settings', { ns: 'modals' })}</span>
				</SettingsTrigger>
			</Popover>
		</SettingsControl>
	)
}
