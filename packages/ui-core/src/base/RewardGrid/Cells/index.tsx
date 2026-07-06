// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react'
import type { ComponentBase } from 'types'
import { Cell } from '../Cell'

export const Cells = ({
	items,
}: ComponentBase & {
	items: React.ReactNode[]
}): ReactNode =>
	items.map((item, i) => (
		<Cell
			key={`cell_${
				// biome-ignore lint/suspicious/noArrayIndexKey: <passing react node array without unique key is not an issue here>
				i
			}`}
		>
			{item}
		</Cell>
	))
