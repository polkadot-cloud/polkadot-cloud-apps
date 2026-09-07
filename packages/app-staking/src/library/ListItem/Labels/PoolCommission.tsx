// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTooltipActions } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const PoolCommission = ({ commission }: { commission: string }) => {
	const { t } = useTranslation('app')
	const { setTooltipTextAndOpen } = useTooltipActions()

	const tooltipText = t('poolCommission')

	if (!commission) {
		return null
	}

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
			/>
			{commission}
		</Label>
	)
}
