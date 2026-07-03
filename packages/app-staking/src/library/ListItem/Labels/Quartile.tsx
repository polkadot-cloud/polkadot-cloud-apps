// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const Quartile = ({ address }: { address: string }) => {
	const { t } = useTranslation()
	const { setTooltipTextAndOpen } = useTooltip()
	const { getValidatorRankSegment } = useValidators()

	const quartile = getValidatorRankSegment(address)
	const tooltipText = `${t('dayPerformanceStanding', {
		count: 30,
		ns: 'app',
	})}`

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
				style={{ cursor: 'default' }}
			/>
			{![100, undefined].includes(quartile)
				? `${t('top', { ns: 'app' })} ${quartile}%`
				: ``}
		</Label>
	)
}
