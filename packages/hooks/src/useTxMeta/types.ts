// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxSubmissionItem } from 'types'

export interface TxMetaHookInterface {
	uids: TxSubmissionItem[]
	getTxSubmission: (uid?: number) => TxSubmissionItem | undefined
	getTxSubmissionByTag: (tag: string) => TxSubmissionItem | undefined
}
