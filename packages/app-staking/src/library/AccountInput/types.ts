// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeAddress } from 'types'

export interface AccountInputProps {
	successCallback: (a: string) => Promise<unknown>
	resetCallback?: () => void
	defaultLabel: string
	resetOnSuccess?: boolean
	successLabel?: string
	locked?: boolean
	inactive?: boolean
	disallowAlreadyImported?: boolean
	initialValue?: MaybeAddress
	border?: boolean
}
