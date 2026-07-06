// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { MouseEvent } from 'react'
import type { OnMouseHandlersProps } from './types'

// Formats mouse handlers for buttons given its props.
export const onMouseHandlers = (props: OnMouseHandlersProps) => {
	const { onClick, onMouseOver, onMouseMove, onMouseOut } = props
	return {
		onClick:
			typeof onClick === 'function'
				? (e: MouseEvent<HTMLButtonElement>) => onClick(e)
				: undefined,
		onMouseOver:
			typeof onMouseOver === 'function'
				? (e: MouseEvent<HTMLButtonElement>) => onMouseOver(e)
				: undefined,
		onMouseMove:
			typeof onMouseMove === 'function'
				? (e: MouseEvent<HTMLButtonElement>) => onMouseMove(e)
				: undefined,
		onMouseOut:
			typeof onMouseOut === 'function'
				? (e: MouseEvent<HTMLButtonElement>) => onMouseOut(e)
				: undefined,
	}
}
