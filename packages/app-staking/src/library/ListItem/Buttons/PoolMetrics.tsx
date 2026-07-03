// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTranslation } from 'react-i18next'
import { HeaderButton } from 'ui-core/list'
import { useOverlay } from 'ui-overlay'
import type { MoreProps } from '../types'

export const PoolMetrics = ({
	pool,
	setActiveTab,
	disabled,
	outline,
}: MoreProps) => {
	const { t } = useTranslation('tips')
	const { openCanvas } = useOverlay().canvas
	const { id } = pool
	return (
		<HeaderButton outline={outline} withText>
			<button
				type="button"
				onClick={() => {
					openCanvas({
						key: 'Pool',
						options: {
							providedPool: {
								id,
							},
							onJoinCallback: () => setActiveTab(0),
						},
						size: 'xl',
					})
				}}
				disabled={disabled}
			>
				{t('metrics', { ns: 'app' })}
			</button>
		</HeaderButton>
	)
}
