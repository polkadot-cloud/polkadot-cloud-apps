// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { RetainmentStatData } from './useRetainmentStatsData'

interface RetainmentStatValueProps {
	stat: RetainmentStatData
	unit?: string
}

export const RetainmentStatValue = ({
	stat,
	unit,
}: RetainmentStatValueProps) => (
	<>
		{stat.icon && <FontAwesomeIcon icon={stat.icon} aria-hidden="true" />}
		<span>
			{stat.prefix}
			{stat.valueText}
		</span>
		{unit !== undefined && stat.value !== undefined && !stat.isMax && (
			<small>{unit}</small>
		)}
	</>
)
