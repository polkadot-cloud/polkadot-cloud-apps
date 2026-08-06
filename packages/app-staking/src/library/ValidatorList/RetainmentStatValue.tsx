// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { RetainmentStatData } from './useRetainmentStatsData'

export const RetainmentStatValue = ({
	stat,
	unit,
}: {
	stat: RetainmentStatData
	unit?: string
}) => (
	<>
		{stat.icon && <FontAwesomeIcon icon={stat.icon} aria-hidden="true" />}
		<span>
			{stat.prefix}
			{stat.valueText}
		</span>
		{unit !== undefined && stat.value !== undefined && <small>{unit}</small>}
	</>
)
