// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { usePlugins } from 'hooks/usePlugins'
import { useTooltip } from 'hooks/useTooltip'
import { getActivityTierColor } from 'library/ValidatorList/activity'
import { useTranslation } from 'react-i18next'
import { TooltipArea } from 'ui-core/base'
import { Label } from 'ui-core/list'

export const ActivityTier = ({ address }: { address: string }) => {
	const { t } = useTranslation()
	const { pluginEnabled } = usePlugins()
	const { setTooltipTextAndOpen } = useTooltip()
	const { getValidatorActivityTier } = useValidators()

	const activityTier = getValidatorActivityTier(address)
	const tooltipText = pluginEnabled('staking_api')
		? t('eraPerformanceStanding', {
				count: 90,
				ns: 'app',
			})
		: t('currentEraPerformanceStanding', { ns: 'app' })

	return (
		<Label style={{ color: getActivityTierColor(activityTier) }}>
			<TooltipArea
				text={tooltipText}
				onMouseMove={() => setTooltipTextAndOpen(tooltipText)}
				style={{ cursor: 'default' }}
			/>
			{activityTier ? t(activityTier, { ns: 'app' }) : ''}
		</Label>
	)
}
