// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faChartPie } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTooltip } from 'hooks/useTooltip'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const RewardShare = ({ share }: { share: number }) => {
	const { t } = useTranslation('pages')
	const { setTooltipTextAndOpen } = useTooltip()

	const tooltipText = t('nominationShareInRewards')

	return (
		<Label>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
			/>
			<FontAwesomeIcon icon={faChartPie} style={{ marginRight: '0.25rem' }} />
			{share}%{' '}
		</Label>
	)
}
