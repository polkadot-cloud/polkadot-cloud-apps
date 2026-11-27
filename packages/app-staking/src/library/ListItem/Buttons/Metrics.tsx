// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePlugins } from 'hooks/usePlugins'
import { useTranslation } from 'react-i18next'
import { ListItem } from 'ui-app/ListItem'
import { HeaderButton } from 'ui-core/list'
import { useOverlay } from 'ui-overlay'
import { validatorMetricsConfig } from '../../../canvas/ValidatorMetrics/config'
import type { MetricsProps } from '../types'

export const Metrics = ({ display, address, outline, wide }: MetricsProps) => {
	const { t } = useTranslation()
	const { pluginEnabled } = usePlugins()
	const { openCanvas } = useOverlay().canvas

	if (!pluginEnabled('staking_api')) return null

	const button = (
		<HeaderButton outline={outline} withText>
			<button
				type="button"
				onClick={() => openCanvas(validatorMetricsConfig(address, display))}
			>
				{t('metrics', { ns: 'app' })}
			</button>
		</HeaderButton>
	)

	return wide ? <ListItem.Action wide>{button}</ListItem.Action> : button
}
