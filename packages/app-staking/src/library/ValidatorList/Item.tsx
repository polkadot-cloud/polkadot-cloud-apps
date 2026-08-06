// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { usePlugins } from 'hooks/usePlugins'
import { BasicItem } from './BasicItem'
import { DetailedItem } from './DetailedItem'
import type { ItemProps } from './types'

export const Item = (props: ItemProps) => {
	const { pluginEnabled } = usePlugins()

	return pluginEnabled('staking_api') ? (
		<DetailedItem {...props} />
	) : (
		<BasicItem {...props} />
	)
}
