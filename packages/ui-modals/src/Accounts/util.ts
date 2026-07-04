// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountListCategory } from './types'

export const getCategoryResizeKey = (categories: AccountListCategory[]) =>
	JSON.stringify(
		categories.map(({ key, labelKey, items }) => ({
			key,
			labelKey,
			items: items.map(({ address, source }) => ({ address, source })),
		})),
	)
