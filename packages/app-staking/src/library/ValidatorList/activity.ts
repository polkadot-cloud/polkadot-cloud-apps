// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ValidatorActivityTier } from 'contexts/Validators/types'

const ACTIVITY_TIER_COLORS: Record<ValidatorActivityTier, string | undefined> =
	{
		belowBaseline: 'var(--status-warning)',
		good: undefined,
		notRated: 'var(--text-tertiary)',
	}

export const getActivityTierColor = (
	activityTier: ValidatorActivityTier | null | undefined,
) => (activityTier ? ACTIVITY_TIER_COLORS[activityTier] : undefined)
