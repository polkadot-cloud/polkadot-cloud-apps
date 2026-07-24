// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const APY = ({ rate }: { rate?: number }) => {
	const { t } = useTranslation()
	const { setTooltipTextAndOpen } = useTooltip()

	if (!rate) {
		return null
	}

	const tooltipText = `${t('averageRewardRate', {
		ns: 'pages',
	})}`

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
				style={{ cursor: 'default' }}
			/>
			{new BigNumber(rate).decimalPlaces(2).toString()}%
			<span
				style={{
					fontSize: '0.85em',
					marginLeft: '0.15rem',
					marginBottom: '0.15rem',
				}}
			>
				APY
			</span>
		</Label>
	)
}
