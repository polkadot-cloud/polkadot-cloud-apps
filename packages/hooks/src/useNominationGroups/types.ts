// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface NominationGroupsData<T> {
	continuing: T[]
	leaving: T[]
	added: T[]
	hasChanges: boolean
	hasActiveEraData: boolean
}
