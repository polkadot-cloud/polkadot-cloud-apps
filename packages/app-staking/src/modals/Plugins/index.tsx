// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	CompulsoryPluginsProduction,
	DisabledPluginsPerNetwork,
	PluginsList,
} from 'consts/plugins'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { Title } from 'library/Modal/Title'
import { useTranslation } from 'react-i18next'
import { ButtonModal } from 'ui-buttons'
import { ButtonList, Padding } from 'ui-core/modal'

export const Plugins = () => {
	const { network } = useNetwork()
	const { plugins, togglePlugin } = usePlugins()
	const { t } = useTranslation()

	const disabledPlugins = DisabledPluginsPerNetwork[network] || []

	return (
		<>
			<Title title={t('plugins', { ns: 'modals' })} />
			<Padding horizontalOnly>
				<ButtonList>
					<h4 style={{ margin: '0.75rem 0.25rem' }}>
						{t('togglePlugins', { ns: 'modals' })}
					</h4>
					{PluginsList.map((plugin) => {
						if (
							import.meta.env.PROD &&
							CompulsoryPluginsProduction.includes(plugin)
						) {
							return null
						}
						return (
							<ButtonModal
								key={plugin}
								label={'toggle'}
								disabled={disabledPlugins.includes(plugin)}
								selected={plugins.includes(plugin)}
								text={t(`plugin.${plugin}`, { ns: 'app' })}
								onClick={() => togglePlugin(plugin)}
							/>
						)
					})}
				</ButtonList>
			</Padding>
		</>
	)
}
