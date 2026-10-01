// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { type ComponentProps, createContext, useContext } from 'react'
import { Popover } from 'ui-core/popover'

export const MenuSurfaceContext = createContext(
	'var(--nomination-menu-surface)',
)

export const MenuPopover = (
	props: Omit<
		ComponentProps<typeof Popover>,
		'background' | 'borderColor' | 'attached' | 'arrow' | 'sideOffset'
	>,
) => {
	const menuSurface = useContext(MenuSurfaceContext)
	const background = `color-mix(in srgb, ${menuSurface} 75%, var(--nomination-popover-highlight))`
	return (
		<Popover
			{...props}
			attached
			background={background}
			borderColor={`color-mix(in srgb, ${background} 91%, var(--gray-1000))`}
		/>
	)
}
