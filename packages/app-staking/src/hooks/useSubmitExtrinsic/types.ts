// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MaybeString } from '@w3ux/types'
import type { SubmittableExtrinsic } from 'dedot'
import type { ActiveAccount, ActiveProxy } from 'types'

export interface UseSubmitExtrinsicProps {
	tx: SubmittableExtrinsic | undefined
	tag?: string
	from: {
		address: MaybeString
		source: MaybeString
		proxy: ActiveProxy | null
	}
	shouldSubmit: boolean
	callbackSubmit?: () => void
	callbackInBlock?: () => void
}

export interface UseSubmitExtrinsic {
	txInitiated: boolean
	uid: number
	onSubmit: () => void
	proxySupported: boolean
	submitAccount: ActiveAccount
	proxyAccount: ActiveProxy | null
}
