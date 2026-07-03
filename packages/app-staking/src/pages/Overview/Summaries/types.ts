// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export interface WarningMessage {
	value: string
	label?: string
	description: string
	faIcon: IconDefinition
	format: 'danger' | 'warning'
}
