// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useRetainmentStatsEnabled } from 'hooks/useRetainmentStatsEnabled'
import { BasicItem } from './BasicItem'
import { DetailedItem } from './DetailedItem'
import type { ItemProps } from './types'

export const Item = (props: ItemProps) => {
	const retainmentStatsEnabled = useRetainmentStatsEnabled()

	return retainmentStatsEnabled ? (
		<DetailedItem {...props} />
	) : (
		<BasicItem {...props} />
	)
}
