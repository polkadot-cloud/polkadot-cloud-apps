// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type ComponentProps, createContext, useContext } from 'react'
import { Popover } from 'ui-core/popover'

export const MenuSurfaceContext = createContext(
	'var(--nomination-menu-surface)',
)

export const MenuPopover = ({
	attached = true,
	...props
}: Omit<
	ComponentProps<typeof Popover>,
	'background' | 'borderColor' | 'arrow' | 'sideOffset'
>) => {
	const menuSurface = useContext(MenuSurfaceContext)
	const background = attached
		? `color-mix(in srgb, ${menuSurface} 50%, var(--nomination-popover-highlight))`
		: undefined
	return (
		<Popover
			{...props}
			attached={attached}
			arrow={false}
			background={background}
			borderColor={
				background
					? `color-mix(in srgb, ${background} 88%, var(--gray-1000))`
					: undefined
			}
		/>
	)
}
