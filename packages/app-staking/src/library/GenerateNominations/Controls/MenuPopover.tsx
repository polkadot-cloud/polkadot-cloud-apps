// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTheme } from 'hooks/useTheme'
import { type ComponentProps, createContext, useContext } from 'react'
import { Popover } from 'ui-core/popover'
import { menuColors } from './menuColors'

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
	const { themeElementRef } = useTheme()
	const menuSurface = useContext(MenuSurfaceContext)
	return (
		<Popover
			portalContainer={themeElementRef.current || undefined}
			side="bottom"
			{...props}
			attached={attached}
			arrow={false}
			{...(attached ? menuColors(menuSurface) : {})}
		/>
	)
}
