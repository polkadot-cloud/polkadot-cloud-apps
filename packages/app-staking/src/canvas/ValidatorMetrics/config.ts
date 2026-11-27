// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'

export const validatorMetricsConfig = (
	validator: string,
	identity: ReactNode,
) =>
	({
		key: 'ValidatorMetrics',
		options: { validator, identity },
		size: 'xl',
		variant: 'card',
	}) as const
