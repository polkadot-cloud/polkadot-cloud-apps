// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { HeaderButton } from 'ui-core/list'
import { useOverlay } from 'ui-overlay'
import type { MetricsProps } from '../types'

export const Metrics = ({ display, address, outline }: MetricsProps) => {
	const { t } = useTranslation()
	const { openCanvas } = useOverlay().canvas

	return (
		<HeaderButton outline={outline} withText>
			<button
				type="button"
				onClick={() =>
					openCanvas({
						key: 'ValidatorMetrics',
						options: {
							validator: address,
							identity: display,
						},
						size: 'xl',
					})
				}
			>
				{t('metrics', { ns: 'app' })}
			</button>
		</HeaderButton>
	)
}
