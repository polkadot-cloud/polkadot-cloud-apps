// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ClaimPermission } from 'types'

export interface ClaimPermissionInputProps {
	current: ClaimPermission
	onChange: (value: ClaimPermission) => void
	disabled?: boolean
}
