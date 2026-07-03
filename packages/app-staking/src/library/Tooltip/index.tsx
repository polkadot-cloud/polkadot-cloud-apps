// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useTooltip } from 'hooks/useTooltip'
import type { RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { Wrapper } from './Wrapper'

export const Tooltip = () => {
	const {
		open,
		text,
		show,
		position,
		showTooltip,
		closeTooltip,
		setTooltipPosition,
	} = useTooltip()

	// Ref for the tooltip element itself.
	const tooltipRef: RefObject<HTMLDivElement | null> = useRef(null)

	const mouseMoveCallback = useCallback(
		(e: MouseEvent) => {
			const { target, pageX, pageY } = e

			if (tooltipRef?.current) {
				setTooltipPosition(
					pageX,
					pageY - (tooltipRef.current.offsetHeight || 0),
				)
				if (!show) {
					showTooltip()
				}
			}

			if (target instanceof HTMLElement) {
				const isTriggerElement = target?.classList.contains(
					'tooltip-trigger-element',
				)
				const dataAttribute = target?.getAttribute('data-tooltip-text') ?? false
				if (!isTriggerElement || dataAttribute !== text) {
					closeTooltip()
				}
			}
		},
		[show, text],
	)

	useEffect(() => {
		if (open === 1) {
			window.addEventListener('mousemove', mouseMoveCallback)
		} else {
			window.removeEventListener('mousemove', mouseMoveCallback)
		}
		return () => {
			window.removeEventListener('mousemove', mouseMoveCallback)
		}
	}, [open, mouseMoveCallback])

	return (
		open === 1 && (
			<Wrapper
				className="tooltip-trigger-element"
				ref={tooltipRef}
				style={{
					position: 'absolute',
					left: `${position[0]}px`,
					top: `${position[1]}px`,
					zIndex: 99,
					opacity: show === 1 ? 1 : 0,
				}}
			>
				<h3 className="tooltip-trigger-element">{text}</h3>
			</Wrapper>
		)
	)
}
